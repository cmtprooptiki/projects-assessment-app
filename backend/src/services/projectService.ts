import { Op } from 'sequelize';
import { Project, ProjectParticipation, Employee, Role, Client } from '../models';
import { AppError } from '../middleware/errorHandler';
import { ProjectCreationAttributes, ProjectStatus } from '../models/Project';

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
      { description: { [Op.like]: `%${search}%` } },
      { status: { [Op.like]: `%${search}%` } },
      { startDate: { [Op.like]: `%${search}%` } },
      { endDate: { [Op.like]: `%${search}%` } },
      { budget: { [Op.like]: `%${search}%` } },
      { confirmationOfGoodPerformance: { [Op.like]: `%${search}%` } },
      { '$client.name$': { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Project.findAndCountAll({
    where,
    include: [{ model: Client, as: 'client', required: false }],
    limit,
    offset,
    order: [['name', 'ASC']],
    distinct: true,
    subQuery: false,
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

  const project = await Project.create({ ...data, status: data.status ?? 'Υπογεγραμμένο' });
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

// ── Cashflow sync ──────────────────────────────────────────────────────────────

export interface CashflowErgo {
  id: number;
  name: string;
  erga_code?: string | null;
  sign_date?: string | null;
  ammount_total?: number | null;
  status: string;
  customer_id?: number | null;
}

const VALID_STATUSES = ['Υπογεγραμμένο', 'Ολοκληρωμένο', 'Αποπληρωμένο'];

export const syncFromCashflow = async (ergo: CashflowErgo) => {
  if (!ergo.name) return { action: 'skipped', reason: 'empty name' };
  if (!VALID_STATUSES.includes(ergo.status)) return { action: 'skipped', reason: 'status not tracked' };

  let clientId: number | null = null;
  if (ergo.customer_id) {
    const client = await Client.findOne({ where: { cashflowId: ergo.customer_id } });
    if (client) clientId = client.id;
  }

  const code = ergo.erga_code?.trim() || `ERG-${ergo.id}`;
  const startDate = ergo.sign_date ? ergo.sign_date.split('T')[0] : new Date().toISOString().split('T')[0];

  const payload = {
    cashflowId: ergo.id,
    name: ergo.name,
    code,
    clientId,
    startDate,
    status: ergo.status as ProjectStatus,
    budget: ergo.ammount_total ?? null,
  };

  const existing = await Project.findOne({ where: { cashflowId: ergo.id } });
  if (existing) {
    await existing.update(payload);
    return { action: 'updated', project: existing };
  }

  const byCode = await Project.findOne({ where: { code } });
  if (byCode) {
    await byCode.update(payload);
    return { action: 'linked', project: byCode };
  }

  const created = await Project.create(payload);
  return { action: 'created', project: created };
};

export const deleteProject = async (id: number) => {
  const project = await Project.findByPk(id);
  if (!project) throw new AppError('Project not found.', 404);
  await project.destroy();
};
