import { Op, fn, col, literal } from 'sequelize';
import { Employee, Contract, Project, Role, ProjectParticipation, Client } from '../models';
import { AppError } from '../middleware/errorHandler';
import { ParticipationFilterQuery } from '../types';

const calcMonths = (startDate: string, endDate: string | null): number => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;
  return Math.max(0, months);
};

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

export const getProjectDashboard = async (projectId: number) => {
  const project = await Project.findByPk(projectId, {
    include: [{ model: Contract, as: 'contracts' }],
  });
  if (!project) throw new AppError('Project not found.', 404);

  const participations = await ProjectParticipation.findAll({
    where: { projectId },
    include: [
      { model: Employee, as: 'employee' },
      { model: Role, as: 'role' },
    ],
    order: [['startDate', 'ASC']],
  });

  const enriched = participations.map((p) => ({
    ...p.toJSON(),
    totalMonths: calcMonths(p.startDate, p.endDate),
  }));

  const uniqueEmployees = new Set(participations.map((p) => p.employeeId)).size;

  const projectJson = project.toJSON() as any;
  const dates = computeProjectDates(projectJson.contracts ?? []);

  return {
    project: { ...projectJson, ...dates },
    participations: enriched,
    stats: {
      totalParticipants: uniqueEmployees,
      totalParticipations: participations.length,
    },
  };
};

export const getEmployeeDashboard = async (employeeId: number) => {
  const employee = await Employee.findByPk(employeeId);
  if (!employee) throw new AppError('Employee not found.', 404);

  const participations = await ProjectParticipation.findAll({
    where: { employeeId },
    include: [
      { model: Project, as: 'project' },
      { model: Role, as: 'role' },
    ],
    order: [['startDate', 'DESC']],
  });

  const enriched = participations.map((p) => ({
    ...p.toJSON(),
    totalMonths: calcMonths(p.startDate, p.endDate),
  }));

  const uniqueProjects = new Set(participations.map((p) => p.projectId)).size;
  const totalMonths = enriched.reduce((sum, p) => sum + p.totalMonths, 0);
  const activeParticipations = participations.filter(
    (p) => !p.endDate || new Date(p.endDate) >= new Date()
  );

  return {
    employee: employee.toJSON(),
    participations: enriched,
    stats: {
      totalProjects: uniqueProjects,
      totalParticipations: participations.length,
      totalMonths,
      activeParticipations: activeParticipations.length,
    },
  };
};

export const getClientDashboard = async (clientId: number) => {
  const client = await Client.findByPk(clientId);
  if (!client) throw new AppError('Client not found.', 404);

  const projects = await Project.findAll({
    where: { clientId },
    include: [{ model: Contract, as: 'contracts' }],
    order: [['id', 'DESC']],
  });
  const projectIds = projects.map((p) => p.id);

  const participations =
    projectIds.length > 0
      ? await ProjectParticipation.findAll({
          where: { projectId: { [Op.in]: projectIds } },
          include: [
            { model: Employee, as: 'employee' },
            { model: Project, as: 'project' },
            { model: Role, as: 'role' },
          ],
          order: [['startDate', 'DESC']],
        })
      : [];

  const enriched = participations.map((p) => ({
    ...p.toJSON(),
    totalMonths: calcMonths(p.startDate, p.endDate),
  }));

  const today = new Date().toISOString().slice(0, 10);
  const projectStats = projects.map((proj) => {
    const projJson = proj.toJSON() as any;
    const dates = computeProjectDates(projJson.contracts ?? []);
    const pp = enriched.filter((p) => p.projectId === proj.id);
    return {
      ...projJson,
      ...dates,
      participationCount: pp.length,
      uniqueEmployees: new Set(pp.map((p) => p.employeeId)).size,
      totalMonths: pp.reduce((s, p) => s + p.totalMonths, 0),
    };
  });

  const activeProjectsCount = projectStats.filter(
    (p) => p.endDate === null || p.endDate >= today
  ).length;

  const employeeMonths: Record<number, { employee: any; totalMonths: number; projectCount: number }> = {};
  enriched.forEach((p) => {
    if (!employeeMonths[p.employeeId]) {
      employeeMonths[p.employeeId] = { employee: (p as any).employee, totalMonths: 0, projectCount: 0 };
    }
    employeeMonths[p.employeeId].totalMonths += p.totalMonths;
    employeeMonths[p.employeeId].projectCount += 1;
  });
  const topEmployees = Object.values(employeeMonths)
    .sort((a, b) => b.totalMonths - a.totalMonths)
    .slice(0, 10);

  const uniqueEmployees = new Set(participations.map((p) => p.employeeId)).size;

  return {
    client: client.toJSON(),
    projects: projectStats,
    participations: enriched,
    topEmployees,
    stats: {
      totalProjects: projects.length,
      activeProjects: activeProjectsCount,
      totalParticipations: participations.length,
      uniqueEmployees,
    },
  };
};

export const getDashboardSummary = async () => {
  const [
    totalEmployees, activeEmployees, totalContracts, activeContracts, totalRoles, totalParticipations,
  ] = await Promise.all([
    Employee.count(),
    Employee.count({ where: { isActive: true } }),
    Contract.count(),
    Contract.count({ where: { status: 'Υπογεγραμμένο' } }),
    Role.count(),
    ProjectParticipation.count(),
  ]);

  const projectsByStatus = await Contract.findAll({
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
    raw: true,
  });

  const employeesByDepartment = await Employee.findAll({
    attributes: ['department', [fn('COUNT', col('id')), 'count']],
    group: ['department'],
    order: [[literal('count'), 'DESC']],
    raw: true,
  });

  const recentParticipations = await ProjectParticipation.findAll({
    include: [
      { model: Employee, as: 'employee' },
      { model: Project, as: 'project' },
      { model: Role, as: 'role' },
    ],
    order: [['createdAt', 'DESC']],
    limit: 5,
  });

  return {
    overview: {
      totalEmployees,
      activeEmployees,
      totalProjects: totalContracts,
      activeProjects: activeContracts,
      totalRoles,
      totalParticipations,
    },
    projectsByStatus,
    employeesByDepartment,
    recentParticipations,
  };
};

export const getFilteredParticipations = async (filters: ParticipationFilterQuery) => {
  const where: Record<string, unknown> = {};
  const employeeWhere: Record<string, unknown> = {};

  if (filters.employeeId) where.employeeId = parseInt(filters.employeeId, 10);
  if (filters.projectId) where.projectId = parseInt(filters.projectId, 10);
  if (filters.roleId) where.roleId = parseInt(filters.roleId, 10);
  if (filters.department) employeeWhere.department = filters.department;

  if (filters.startDate) where.startDate = { [Op.gte as unknown as string]: filters.startDate };
  if (filters.endDate) {
    where.endDate = { [Op.or as unknown as string]: [{ [Op.lte as unknown as string]: filters.endDate }, null] };
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

  const participations = await ProjectParticipation.findAll({
    where,
    include: [
      { model: Employee, as: 'employee', where: Object.keys(employeeWhere).length ? employeeWhere : undefined },
      { model: Project, as: 'project' },
      { model: Role, as: 'role' },
    ],
    order: [['startDate', 'DESC']],
  });

  const enriched = participations.map((p) => ({
    ...p.toJSON(),
    totalMonths: calcMonths(p.startDate, p.endDate),
  }));

  return { data: enriched, total: enriched.length };
};
