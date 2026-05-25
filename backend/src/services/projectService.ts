import { Op } from 'sequelize';
import { Project, ProjectParticipation, Employee, Role, Client } from '../models';
import { AppError } from '../middleware/errorHandler';
import { ProjectCreationAttributes } from '../models/Project';

export const getAllProjects = async (filters: {
  status?: string;
  clientId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { status, clientId, search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (status) where.status = status;
  if (clientId) where.clientId = parseInt(clientId, 10);
  if (search) {
    where[Op.or as unknown as string] = [
      { name: { [Op.like]: `%${search}%` } },
      { code: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Project.findAndCountAll({
    where,
    include: [{ model: Client, as: 'client' }],
    limit,
    offset,
    order: [['name', 'ASC']],
    distinct: true,
  });

  return {
    data: rows,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getProjectById = async (id: number) => {
  const project = await Project.findByPk(id, {
    include: [
      { model: Client, as: 'client' },
      {
        model: ProjectParticipation,
        as: 'participations',
        include: [
          { model: Employee, as: 'employee' },
          { model: Role, as: 'role' },
        ],
      },
    ],
  });

  if (!project) throw new AppError('Project not found.', 404);
  return project;
};

export const createProject = async (data: ProjectCreationAttributes) => {
  const existing = await Project.findOne({ where: { code: data.code } });
  if (existing) throw new AppError('A project with this code already exists.', 409);

  if (data.clientId) {
    const client = await Client.findByPk(data.clientId);
    if (!client) throw new AppError('Client not found.', 404);
  }

  const project = await Project.create(data);
  return Project.findByPk(project.id, { include: [{ model: Client, as: 'client' }] });
};

export const updateProject = async (
  id: number,
  data: Partial<ProjectCreationAttributes>
) => {
  const project = await Project.findByPk(id);
  if (!project) throw new AppError('Project not found.', 404);

  if (data.code && data.code !== project.code) {
    const existing = await Project.findOne({ where: { code: data.code } });
    if (existing) throw new AppError('A project with this code already exists.', 409);
  }

  if (data.clientId) {
    const client = await Client.findByPk(data.clientId);
    if (!client) throw new AppError('Client not found.', 404);
  }

  await project.update(data);
  return Project.findByPk(id, { include: [{ model: Client, as: 'client' }] });
};

export const deleteProject = async (id: number) => {
  const project = await Project.findByPk(id);
  if (!project) throw new AppError('Project not found.', 404);
  await project.destroy();
};
