import { Op } from 'sequelize';
import { Contract, ProjectParticipation, Employee, Role, Client } from '../models';
import { AppError } from '../middleware/errorHandler';
import { ContractCreationAttributes, ContractStatus } from '../models/Contract';

export const getAllContracts = async (filters: {
  status?: string;
  clientId?: string;
  projectId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { status, clientId, projectId, search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (clientId) where.clientId = parseInt(clientId, 10);
  if (projectId) where.projectId = parseInt(projectId, 10);
  if (search) {
    const like = { [Op.like]: `%${search}%` };
    where[Op.or as unknown as string] = [
      { name: like },
      { code: like },
      { description: like },
      { status: like },
      { startDate: like },
      { endDate: like },
      { budget: like },
      { confirmationOfGoodPerformance: like },
      { '$client.name$': like },
    ];
  }

  const { count, rows } = await Contract.findAndCountAll({
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
    meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };
};

export const getContractById = async (id: number) => {
  const contract = await Contract.findByPk(id, {
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
  if (!contract) throw new AppError('Contract not found.', 404);
  return contract;
};

export const createContract = async (data: ContractCreationAttributes) => {
  const existing = await Contract.findOne({ where: { code: data.code } });
  if (existing) throw new AppError('A contract with this code already exists.', 409);
  if (data.clientId) {
    const client = await Client.findByPk(data.clientId);
    if (!client) throw new AppError('Client not found.', 404);
  }
  const contract = await Contract.create({ ...data, status: data.status ?? 'Υπογεγραμμένο' });
  return Contract.findByPk(contract.id, { include: [{ model: Client, as: 'client' }] });
};

export const updateContract = async (id: number, data: Partial<ContractCreationAttributes>) => {
  const contract = await Contract.findByPk(id);
  if (!contract) throw new AppError('Contract not found.', 404);
  if (data.code && data.code !== contract.code) {
    const existing = await Contract.findOne({ where: { code: data.code } });
    if (existing) throw new AppError('A contract with this code already exists.', 409);
  }
  if (data.clientId) {
    const client = await Client.findByPk(data.clientId);
    if (!client) throw new AppError('Client not found.', 404);
  }
  await contract.update(data);
  return Contract.findByPk(id, { include: [{ model: Client, as: 'client' }] });
};

export const deleteContract = async (id: number) => {
  const contract = await Contract.findByPk(id);
  if (!contract) throw new AppError('Contract not found.', 404);
  await contract.destroy();
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
    status: ergo.status as ContractStatus,
    budget: ergo.ammount_total ?? null,
  };

  const existing = await Contract.findOne({ where: { cashflowId: ergo.id } });
  if (existing) {
    await existing.update(payload);
    return { action: 'updated', contract: existing };
  }

  const byCode = await Contract.findOne({ where: { code } });
  if (byCode) {
    await byCode.update(payload);
    return { action: 'linked', contract: byCode };
  }

  const created = await Contract.create(payload);
  return { action: 'created', contract: created };
};
