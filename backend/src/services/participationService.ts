import { Op } from 'sequelize';
import { ProjectParticipation, Employee, Project, Contract, Role, EmployeeAvailabilityPeriod } from '../models';
import { AppError } from '../middleware/errorHandler';
import { ProjectParticipationCreationAttributes } from '../models/ProjectParticipation';
import { ParticipationFilterQuery } from '../types';

const computeProjectStartEnd = (contracts: Array<{ startDate: string; endDate?: string | null }>) => {
  if (!contracts || contracts.length === 0) return { startDate: null, endDate: null };
  const starts = contracts.map((c) => c.startDate).filter(Boolean) as string[];
  const hasOngoing = contracts.some((c) => c.endDate == null);
  const ends = contracts.map((c) => c.endDate).filter(Boolean) as string[];
  return {
    startDate: starts.length ? starts.reduce((min, d) => (d < min ? d : min)) : null,
    endDate: hasOngoing ? null : ends.length ? ends.reduce((max, d) => (d > max ? d : max)) : null,
  };
};

const buildParticipationWhere = (filters: ParticipationFilterQuery) => {
  const where: Record<string, unknown> = {};
  const employeeWhere: Record<string, unknown> = {};

  if (filters.employeeId) where.employeeId = parseInt(filters.employeeId, 10);
  if (filters.projectId) where.projectId = parseInt(filters.projectId, 10);
  if (filters.roleId) where.roleId = parseInt(filters.roleId, 10);
  if (filters.department) employeeWhere.department = filters.department;

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

  return { where, employeeWhere };
};

export const getAllParticipations = async (filters: ParticipationFilterQuery) => {
  const page = parseInt(filters.page || '1', 10);
  const limit = parseInt(filters.limit || '20', 10);
  const offset = (page - 1) * limit;

  const { where, employeeWhere } = buildParticipationWhere(filters);

  const { count, rows } = await ProjectParticipation.findAndCountAll({
    where,
    include: [
      { model: Employee, as: 'employee', where: Object.keys(employeeWhere).length ? employeeWhere : undefined },
      { model: Project, as: 'project' },
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
      { model: Project, as: 'project' },
      { model: Role, as: 'role' },
    ],
  });
  if (!participation) throw new AppError('Participation record not found.', 404);
  return participation;
};

export const createParticipations = async (data: {
  employeeId: number;
  projectId: number;
  roleId: number;
  notes?: string | null;
  startDate?: string;
  endDate?: string | null;
}) => {
  const [employeeWithPeriods, projectWithContracts, role] = await Promise.all([
    Employee.findByPk(data.employeeId, {
      include: [{ model: EmployeeAvailabilityPeriod, as: 'availabilityPeriods' }],
    }),
    Project.findByPk(data.projectId, {
      include: [{ model: Contract, as: 'contracts' }],
    }),
    Role.findByPk(data.roleId),
  ]);

  if (!employeeWithPeriods) throw new AppError('Employee not found.', 404);
  if (!projectWithContracts) throw new AppError('Project not found.', 404);
  if (!role) throw new AppError('Role not found.', 404);

  const employeeJson = employeeWithPeriods.toJSON() as any;

  // Replace all existing participations for this employee-project pair
  await ProjectParticipation.destroy({
    where: { employeeId: data.employeeId, projectId: data.projectId },
  });

  let rows: ProjectParticipationCreationAttributes[];

  if (employeeJson.isExternal) {
    // External: use manually provided dates, no availability/contract logic
    if (!data.startDate) throw new AppError('Start date is required for external partners.', 422);

    const projectJson = projectWithContracts.toJSON() as any;
    const { startDate: projectStart, endDate: projectEnd } = computeProjectStartEnd(projectJson.contracts ?? []);

    if (projectStart && data.startDate < projectStart) {
      throw new AppError(`Start date cannot be before the project start date (${projectStart}).`, 422);
    }
    if (projectEnd && data.startDate > projectEnd) {
      throw new AppError(`Start date cannot be after the project end date (${projectEnd}).`, 422);
    }
    if (data.endDate && projectEnd && data.endDate > projectEnd) {
      throw new AppError(`End date cannot be after the project end date (${projectEnd}).`, 422);
    }
    if (data.endDate && projectStart && data.endDate < projectStart) {
      throw new AppError(`End date cannot be before the project start date (${projectStart}).`, 422);
    }

    rows = [{
      employeeId: data.employeeId,
      projectId: data.projectId,
      roleId: data.roleId,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
      notes: data.notes ?? null,
    }];
  } else {
    // Internal: auto-split by availability periods × project contract dates
    const projectJson = projectWithContracts.toJSON() as any;

    const availabilityPeriods: Array<{ startDate: string; endDate: string | null }> =
      (employeeJson.availabilityPeriods ?? []).sort((a: any, b: any) =>
        a.startDate.localeCompare(b.startDate)
      );

    if (availabilityPeriods.length === 0) {
      throw new AppError('Employee has no availability periods defined.', 422);
    }

    const { startDate: projectStart, endDate: projectEnd } = computeProjectStartEnd(
      projectJson.contracts ?? []
    );

    if (!projectStart) {
      throw new AppError('Project has no linked contracts with dates.', 422);
    }

    rows = [];
    const today = new Date().toISOString().split('T')[0];

    for (const avail of availabilityPeriods) {
      const availStart = avail.startDate;
      const effectiveAvailEnd = avail.endDate ?? today;

      const projectAfterAvail = projectStart > effectiveAvailEnd;
      const availAfterProject = projectEnd !== null && availStart > projectEnd;
      if (projectAfterAvail || availAfterProject) continue;

      const overlapStart = availStart > projectStart ? availStart : projectStart;

      let overlapEnd: string =
        projectEnd === null
          ? effectiveAvailEnd
          : projectEnd < effectiveAvailEnd
            ? projectEnd
            : effectiveAvailEnd;

      if (overlapEnd > today) overlapEnd = today;

      rows.push({
        employeeId: data.employeeId,
        projectId: data.projectId,
        roleId: data.roleId,
        startDate: overlapStart,
        endDate: overlapEnd,
        notes: data.notes ?? null,
      });
    }

    if (rows.length === 0) {
      throw new AppError('No availability periods overlap with the project dates.', 422);
    }
  }

  const created = await ProjectParticipation.bulkCreate(rows);

  return ProjectParticipation.findAll({
    where: { id: { [Op.in]: created.map((p) => p.id) } },
    include: [
      { model: Employee, as: 'employee' },
      { model: Project, as: 'project' },
      { model: Role, as: 'role' },
    ],
    order: [['startDate', 'ASC']],
  });
};

export const updateParticipation = async (
  id: number,
  data: { roleId?: number; notes?: string | null; startDate?: string; endDate?: string | null }
) => {
  const participation = await ProjectParticipation.findByPk(id);
  if (!participation) throw new AppError('Participation record not found.', 404);

  if (data.roleId) {
    const role = await Role.findByPk(data.roleId);
    if (!role) throw new AppError('Role not found.', 404);
  }

  await participation.update(data);
  return ProjectParticipation.findByPk(id, {
    include: [
      { model: Employee, as: 'employee' },
      { model: Project, as: 'project' },
      { model: Role, as: 'role' },
    ],
  });
};

export const deleteParticipation = async (id: number) => {
  const participation = await ProjectParticipation.findByPk(id);
  if (!participation) throw new AppError('Participation record not found.', 404);
  await participation.destroy();
};

export const recalculateParticipations = async (): Promise<{ updated: number }> => {
  const today = new Date().toISOString().split('T')[0];

  const internalEmployees = await Employee.findAll({ where: { isExternal: false }, attributes: ['id'] });
  const internalIds = internalEmployees.map((e) => e.id);

  if (internalIds.length === 0) return { updated: 0 };

  const [updated] = await ProjectParticipation.update(
    { endDate: today },
    {
      where: {
        employeeId: { [Op.in]: internalIds },
        [Op.or]: [
          { endDate: null },
          { endDate: { [Op.gt]: today } },
        ],
      },
    }
  );

  return { updated };
};
