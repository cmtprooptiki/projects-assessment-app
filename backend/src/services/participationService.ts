import { Op } from 'sequelize';
import { ProjectParticipation, Employee, Contract, Role } from '../models';
import { AppError } from '../middleware/errorHandler';
import { ProjectParticipationCreationAttributes } from '../models/ProjectParticipation';
import { ParticipationFilterQuery } from '../types';

const validateDatesAgainstContract = (
  startDate: string,
  endDate: string | null,
  contract: Contract
) => {
  const today = new Date().toISOString().slice(0, 10);
  const contractStart = contract.startDate;
  const contractEnd = contract.endDate ?? today;

  if (startDate < contractStart)
    throw new AppError(`Start date cannot be before the contract start date (${contractStart}).`, 422);
  if (startDate > contractEnd)
    throw new AppError(`Start date cannot be after the contract end date (${contractEnd}).`, 422);
  if (endDate) {
    if (endDate < contractStart)
      throw new AppError(`End date cannot be before the contract start date (${contractStart}).`, 422);
    if (endDate > contractEnd)
      throw new AppError(`End date cannot be after the contract end date (${contractEnd}).`, 422);
  }
};

const buildParticipationWhere = (filters: ParticipationFilterQuery) => {
  const where: Record<string, unknown> = {};
  const employeeWhere: Record<string, unknown> = {};
  const contractWhere: Record<string, unknown> = {};

  if (filters.employeeId) where.employeeId = parseInt(filters.employeeId, 10);
  if (filters.projectId) where.projectId = parseInt(filters.projectId, 10);
  if (filters.roleId) where.roleId = parseInt(filters.roleId, 10);
  if (filters.department) employeeWhere.department = filters.department;
  if (filters.status) contractWhere.status = filters.status;

  if (filters.startDate || filters.endDate) {
    const dateFilter: Record<string, unknown> = {};
    if (filters.startDate) dateFilter[Op.gte as unknown as string] = filters.startDate;
    if (filters.endDate) dateFilter[Op.lte as unknown as string] = filters.endDate;
    where.startDate = dateFilter;
  }

  if (filters.year || filters.month) {
    const year = filters.year ? parseInt(filters.year, 10) : null;
    const month = filters.month ? parseInt(filters.month, 10) : null;

    if (year && month) {
      const paddedMonth = String(month).padStart(2, '0');
      const start = `${year}-${paddedMonth}-01`;
      const end = `${year}-${paddedMonth}-31`;
      where.startDate = { [Op.lte as unknown as string]: end };
      where[Op.or as unknown as string] = [
        { endDate: null },
        { endDate: { [Op.gte as unknown as string]: start } },
      ];
    } else if (year) {
      where.startDate = { [Op.lte as unknown as string]: `${year}-12-31` };
      where[Op.or as unknown as string] = [
        { endDate: null },
        { endDate: { [Op.gte as unknown as string]: `${year}-01-01` } },
      ];
    }
  }

  return { where, employeeWhere, contractWhere };
};

export const getAllParticipations = async (filters: ParticipationFilterQuery) => {
  const page = parseInt(filters.page || '1', 10);
  const limit = parseInt(filters.limit || '20', 10);
  const offset = (page - 1) * limit;

  const { where, employeeWhere, contractWhere } = buildParticipationWhere(filters);

  const { count, rows } = await ProjectParticipation.findAndCountAll({
    where,
    include: [
      { model: Employee, as: 'employee', where: Object.keys(employeeWhere).length ? employeeWhere : undefined },
      { model: Contract, as: 'project', where: Object.keys(contractWhere).length ? contractWhere : undefined },
      { model: Role, as: 'role' },
    ],
    limit,
    offset,
    order: [['startDate', 'DESC']],
    distinct: true,
  });

  return {
    data: rows,
    meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };
};

export const getParticipationById = async (id: number) => {
  const participation = await ProjectParticipation.findByPk(id, {
    include: [
      { model: Employee, as: 'employee' },
      { model: Contract, as: 'project' },
      { model: Role, as: 'role' },
    ],
  });
  if (!participation) throw new AppError('Participation record not found.', 404);
  return participation;
};

export const createParticipation = async (data: ProjectParticipationCreationAttributes) => {
  const [employee, contract, role] = await Promise.all([
    Employee.findByPk(data.employeeId),
    Contract.findByPk(data.projectId),
    Role.findByPk(data.roleId),
  ]);

  if (!employee) throw new AppError('Employee not found.', 404);
  if (!contract) throw new AppError('Contract not found.', 404);
  if (!role) throw new AppError('Role not found.', 404);

  validateDatesAgainstContract(data.startDate, data.endDate ?? null, contract);

  const participation = await ProjectParticipation.create(data);
  return ProjectParticipation.findByPk(participation.id, {
    include: [
      { model: Employee, as: 'employee' },
      { model: Contract, as: 'project' },
      { model: Role, as: 'role' },
    ],
  });
};

export const updateParticipation = async (id: number, data: Partial<ProjectParticipationCreationAttributes>) => {
  const participation = await ProjectParticipation.findByPk(id);
  if (!participation) throw new AppError('Participation record not found.', 404);

  if (data.employeeId) {
    const employee = await Employee.findByPk(data.employeeId);
    if (!employee) throw new AppError('Employee not found.', 404);
  }
  let resolvedContract: Contract | null = null;
  if (data.projectId) {
    resolvedContract = await Contract.findByPk(data.projectId);
    if (!resolvedContract) throw new AppError('Contract not found.', 404);
  }
  if (data.roleId) {
    const role = await Role.findByPk(data.roleId);
    if (!role) throw new AppError('Role not found.', 404);
  }

  const effectiveStartDate = data.startDate ?? participation.startDate;
  const effectiveEndDate = 'endDate' in data ? (data.endDate ?? null) : participation.endDate;
  const contractForValidation = resolvedContract ?? await Contract.findByPk(participation.projectId);
  if (contractForValidation && (data.startDate || 'endDate' in data)) {
    validateDatesAgainstContract(effectiveStartDate, effectiveEndDate, contractForValidation);
  }

  await participation.update(data);
  return ProjectParticipation.findByPk(id, {
    include: [
      { model: Employee, as: 'employee' },
      { model: Contract, as: 'project' },
      { model: Role, as: 'role' },
    ],
  });
};

export const deleteParticipation = async (id: number) => {
  const participation = await ProjectParticipation.findByPk(id);
  if (!participation) throw new AppError('Participation record not found.', 404);
  await participation.destroy();
};
