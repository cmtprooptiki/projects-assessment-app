import { Op } from 'sequelize';
import { Project, Contract, Client } from '../models';
import { AppError } from '../middleware/errorHandler';
import { ProjectCreationAttributes } from '../models/Project';

const generateProjectCode = async (): Promise<string> => {
  const last = await Project.findOne({ order: [['id', 'DESC']] });
  const nextNum = last ? last.id + 1 : 1;
  return `PRJ-${String(nextNum).padStart(5, '0')}`;
};

// startDate = earliest contract startDate
// endDate   = latest contract endDate, or null if any contract is ongoing
const computeProjectDates = (contracts: Array<{ startDate: string; endDate?: string | null }>) => {
  if (!contracts || contracts.length === 0) return { startDate: null, endDate: null };
  const starts = contracts.map((c) => c.startDate).filter(Boolean) as string[];
  const hasOngoing = contracts.some((c) => c.endDate == null);
  const ends = contracts.map((c) => c.endDate).filter(Boolean) as string[];
  return {
    startDate: starts.length ? starts.reduce((min, d) => (d < min ? d : min)) : null,
    endDate: hasOngoing ? null : ends.length ? ends.reduce((max, d) => (d > max ? d : max)) : null,
  };
};

const withDates = (p: any) => {
  const json = p.toJSON ? p.toJSON() : p;
  return { ...json, ...computeProjectDates(json.contracts ?? []) };
};

export const getAllProjects = async (filters: {
  clientId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { clientId, search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (clientId) where.clientId = parseInt(clientId, 10);
  if (search) {
    const like = { [Op.like]: `%${search}%` };
    where[Op.or as unknown as string] = [
      { name: like },
      { acronym: like },
      { description: like },
      { projectCode: like },
      { '$client.name$': like },
    ];
  }

  const { count, rows } = await Project.findAndCountAll({
    where,
    include: [
      { model: Client, as: 'client', required: false },
      { model: Contract, as: 'contracts', required: false },
    ],
    limit,
    offset,
    order: [['projectCode', 'ASC']],
    distinct: true,
    subQuery: false,
  });

  return {
    data: rows.map(withDates),
    meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };
};

export const getProjectById = async (id: number) => {
  const project = await Project.findByPk(id, {
    include: [
      { model: Client, as: 'client' },
      { model: Contract, as: 'contracts', include: [{ model: Client, as: 'client' }] },
    ],
  });
  if (!project) throw new AppError('Project not found.', 404);
  return withDates(project);
};

export const createProject = async (data: Omit<ProjectCreationAttributes, 'projectCode'>) => {
  if (data.clientId) {
    const client = await Client.findByPk(data.clientId);
    if (!client) throw new AppError('Client not found.', 404);
  }
  const projectCode = await generateProjectCode();
  const project = await Project.create({ ...data, projectCode });
  const full = await Project.findByPk(project.id, {
    include: [{ model: Client, as: 'client' }, { model: Contract, as: 'contracts' }],
  });
  return withDates(full!);
};

export const updateProject = async (id: number, data: Partial<Omit<ProjectCreationAttributes, 'projectCode'>>) => {
  const project = await Project.findByPk(id);
  if (!project) throw new AppError('Project not found.', 404);
  if (data.clientId) {
    const client = await Client.findByPk(data.clientId);
    if (!client) throw new AppError('Client not found.', 404);
  }
  await project.update(data);
  const full = await Project.findByPk(id, {
    include: [{ model: Client, as: 'client' }, { model: Contract, as: 'contracts' }],
  });
  return withDates(full!);
};

export const deleteProject = async (id: number) => {
  const project = await Project.findByPk(id);
  if (!project) throw new AppError('Project not found.', 404);
  // Unlink contracts so they are not deleted with the project
  await Contract.update({ projectId: null } as any, { where: { projectId: id } });
  await project.destroy();
};

export const linkContractsToProject = async (projectId: number, contractIds: number[]) => {
  const project = await Project.findByPk(projectId);
  if (!project) throw new AppError('Project not found.', 404);
  await Contract.update({ projectId: null } as any, { where: { projectId } });
  if (contractIds.length > 0) {
    await Contract.update({ projectId } as any, { where: { id: contractIds } });
  }
  const full = await Project.findByPk(projectId, {
    include: [{ model: Client, as: 'client' }, { model: Contract, as: 'contracts' }],
  });
  return withDates(full!);
};
