// eslint-disable-next-line @typescript-eslint/no-var-requires
const XLSX = require('xlsx');
import { Op } from 'sequelize';
import { ProjectParticipation, Employee, Project, Contract, Role, EmployeeAvailabilityPeriod } from '../models';
import { AppError } from '../middleware/errorHandler';
import { ProjectParticipationCreationAttributes } from '../models/ProjectParticipation';
import { ParticipationFilterQuery } from '../types';

export interface BulkPreviewSuccessRow {
  rowIndex: number;
  employeeId: number;
  employeeName: string;
  projectId: number;
  projectName: string;
  roleId: number;
  roleName: string;
  periods: Array<{ startDate: string; endDate: string }>;
}

export interface BulkPreviewErrorRow {
  rowIndex: number;
  employeeId: number | null;
  projectId: number | null;
  roleId: number | null;
  reason: string;
}

// Normalise column headers: "employee_id", "Employee ID" → "employeeid"
const normKey = (k: string) => k.toLowerCase().replace(/[\s_-]/g, '');
const normRow = (raw: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) out[normKey(k)] = v;
  return out;
};

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

const PARTICIPATION_SORT: Record<string, any[]> = {
  employee:  [[{ model: Employee, as: 'employee' }, 'firstName', 'ASC'], [{ model: Employee, as: 'employee' }, 'lastName', 'ASC']],
  project:   [[{ model: Project, as: 'project' }, 'name', 'ASC']],
  role:      [[{ model: Role, as: 'role' }, 'name', 'ASC']],
  startDate: [['startDate', 'ASC']],
  endDate:   [['endDate', 'ASC']],
};

export const getAllParticipations = async (filters: ParticipationFilterQuery) => {
  const page = parseInt(filters.page || '1', 10);
  const limit = parseInt(filters.limit || '20', 10);
  const offset = (page - 1) * limit;
  const dir = filters.sortOrder === 'desc' ? 'DESC' : filters.sortOrder === 'asc' ? 'ASC' : null;
  const sortField = filters.sortBy && PARTICIPATION_SORT[filters.sortBy] ? filters.sortBy : null;
  const order: any = sortField
    ? PARTICIPATION_SORT[sortField].map((clause) => [...clause.slice(0, -1), dir ?? clause[clause.length - 1]])
    : [['startDate', 'DESC']];

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
    order,
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

  const isExternal: boolean = employeeJson.isExternal ?? false;

  if (isExternal) {
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
      isExternal: true,
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
        isExternal: false,
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

  // isExternal is immutable — only stamp at creation, never update
  const { roleId, notes, startDate, endDate } = data;
  await participation.update({ roleId, notes, startDate, endDate });
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

export const recalculateParticipations = async (): Promise<{ updated: number; skipped: number }> => {
  const today = new Date().toISOString().split('T')[0];

  // Collect all internal participations, deduplicate by (employeeId, projectId)
  const all = await ProjectParticipation.findAll({
    where: { isExternal: false },
    order: [['createdAt', 'ASC']],
  });

  const pairs = new Map<string, { employeeId: number; projectId: number; roleId: number; notes: string | null }>();
  for (const p of all) {
    const key = `${p.employeeId}-${p.projectId}`;
    if (!pairs.has(key)) {
      pairs.set(key, { employeeId: p.employeeId, projectId: p.projectId, roleId: p.roleId, notes: p.notes ?? null });
    }
  }

  let updated = 0;
  let skipped = 0;

  for (const { employeeId, projectId, roleId, notes } of pairs.values()) {
    const [employee, project] = await Promise.all([
      Employee.findByPk(employeeId, { include: [{ model: EmployeeAvailabilityPeriod, as: 'availabilityPeriods' }] }),
      Project.findByPk(projectId,   { include: [{ model: Contract, as: 'contracts' }] }),
    ]);

    if (!employee || !project) { skipped++; continue; }

    const employeeJson = employee.toJSON() as any;
    const projectJson  = project.toJSON()  as any;

    const availabilityPeriods: Array<{ startDate: string; endDate: string | null }> =
      (employeeJson.availabilityPeriods ?? []).sort((a: any, b: any) => a.startDate.localeCompare(b.startDate));

    if (availabilityPeriods.length === 0) { skipped++; continue; }

    const { startDate: projectStart, endDate: projectEnd } = computeProjectStartEnd(projectJson.contracts ?? []);
    if (!projectStart) { skipped++; continue; }

    const rows: ProjectParticipationCreationAttributes[] = [];

    for (const avail of availabilityPeriods) {
      const availStart       = avail.startDate;
      const effectiveAvailEnd = avail.endDate ?? today;

      if (projectStart > effectiveAvailEnd) continue;
      if (projectEnd !== null && availStart > projectEnd) continue;

      const overlapStart = availStart > projectStart ? availStart : projectStart;
      let overlapEnd: string =
        projectEnd === null
          ? effectiveAvailEnd
          : projectEnd < effectiveAvailEnd ? projectEnd : effectiveAvailEnd;

      if (overlapEnd > today) overlapEnd = today;

      rows.push({ employeeId, projectId, roleId, startDate: overlapStart, endDate: overlapEnd, notes, isExternal: false });
    }

    if (rows.length === 0) { skipped++; continue; }

    await ProjectParticipation.destroy({ where: { employeeId, projectId, isExternal: false } });
    await ProjectParticipation.bulkCreate(rows);
    updated++;
  }

  return { updated, skipped };
};

export const bulkPreview = async (
  fileBuffer: Buffer,
): Promise<{ success: BulkPreviewSuccessRow[]; errors: BulkPreviewErrorRow[] }> => {
  const today = new Date().toISOString().split('T')[0];

  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

  const success: BulkPreviewSuccessRow[] = [];
  const errors: BulkPreviewErrorRow[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const r = normRow(rawRows[i]);
    const rowIndex = i + 2; // +2: 1-based + header row
    const employeeId = parseInt(String(r.employeeid ?? r.employee ?? ''), 10);
    const projectId  = parseInt(String(r.projectid  ?? r.project  ?? ''), 10);
    const roleId     = parseInt(String(r.roleid     ?? r.role     ?? ''), 10);

    if (isNaN(employeeId) || isNaN(projectId) || isNaN(roleId)) {
      errors.push({ rowIndex, employeeId: isNaN(employeeId) ? null : employeeId, projectId: isNaN(projectId) ? null : projectId, roleId: isNaN(roleId) ? null : roleId, reason: 'Missing or invalid employeeId / projectId / roleId' });
      continue;
    }

    const [employee, project, role] = await Promise.all([
      Employee.findByPk(employeeId, { include: [{ model: EmployeeAvailabilityPeriod, as: 'availabilityPeriods' }] }),
      Project.findByPk(projectId,   { include: [{ model: Contract, as: 'contracts' }] }),
      Role.findByPk(roleId),
    ]);

    if (!employee) { errors.push({ rowIndex, employeeId, projectId, roleId, reason: `Employee #${employeeId} not found` }); continue; }
    if (!project)  { errors.push({ rowIndex, employeeId, projectId, roleId, reason: `Project #${projectId} not found` });  continue; }
    if (!role)     { errors.push({ rowIndex, employeeId, projectId, roleId, reason: `Role #${roleId} not found` });        continue; }

    const empJson  = employee.toJSON() as any;
    const projJson = project.toJSON()  as any;

    if (empJson.isExternal) {
      errors.push({ rowIndex, employeeId, projectId, roleId, reason: `Employee "${empJson.firstName} ${empJson.lastName}" is external — bulk import only supports internal employees` });
      continue;
    }

    const availabilityPeriods: Array<{ startDate: string; endDate: string | null }> =
      (empJson.availabilityPeriods ?? []).sort((a: any, b: any) => a.startDate.localeCompare(b.startDate));

    if (availabilityPeriods.length === 0) {
      errors.push({ rowIndex, employeeId, projectId, roleId, reason: `Employee "${empJson.firstName} ${empJson.lastName}" has no availability periods` });
      continue;
    }

    const { startDate: projectStart, endDate: projectEnd } = computeProjectStartEnd(projJson.contracts ?? []);
    if (!projectStart) {
      errors.push({ rowIndex, employeeId, projectId, roleId, reason: `Project "${projJson.name}" has no linked contracts with dates` });
      continue;
    }

    const periods: Array<{ startDate: string; endDate: string }> = [];
    for (const avail of availabilityPeriods) {
      const availStart        = avail.startDate;
      const effectiveAvailEnd = avail.endDate ?? today;
      if (projectStart > effectiveAvailEnd) continue;
      if (projectEnd !== null && availStart > projectEnd) continue;
      const overlapStart = availStart > projectStart ? availStart : projectStart;
      let overlapEnd = projectEnd === null
        ? effectiveAvailEnd
        : projectEnd < effectiveAvailEnd ? projectEnd : effectiveAvailEnd;
      if (overlapEnd > today) overlapEnd = today;
      periods.push({ startDate: overlapStart, endDate: overlapEnd });
    }

    if (periods.length === 0) {
      errors.push({ rowIndex, employeeId, projectId, roleId, reason: `No availability periods overlap with project "${projJson.name}" (${projectStart} → ${projectEnd ?? 'ongoing'})` });
      continue;
    }

    success.push({ rowIndex, employeeId, employeeName: `${empJson.firstName} ${empJson.lastName}`, projectId, projectName: projJson.name, roleId, roleName: (role as any).name, periods });
  }

  return { success, errors };
};

export const bulkConfirm = async (
  rows: Array<{ employeeId: number; projectId: number; roleId: number; periods: Array<{ startDate: string; endDate: string }> }>,
): Promise<{ imported: number; participationsCreated: number }> => {
  let imported = 0;
  let participationsCreated = 0;

  for (const { employeeId, projectId, roleId, periods } of rows) {
    await ProjectParticipation.destroy({ where: { employeeId, projectId, isExternal: false } });
    await ProjectParticipation.bulkCreate(
      periods.map((p) => ({ employeeId, projectId, roleId, startDate: p.startDate, endDate: p.endDate, notes: null, isExternal: false }))
    );
    imported++;
    participationsCreated += periods.length;
  }

  return { imported, participationsCreated };
};
