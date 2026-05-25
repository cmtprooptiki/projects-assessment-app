import { Op, fn, col, literal } from 'sequelize';
import { Employee, Project, Role, ProjectParticipation, Client } from '../models';
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

export const getProjectDashboard = async (projectId: number) => {
  const project = await Project.findByPk(projectId);
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

  return {
    project: project.toJSON(),
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

  const projects = await Project.findAll({ where: { clientId }, order: [['startDate', 'DESC']] });
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

  const projectStats = projects.map((proj) => {
    const pp = enriched.filter((p) => p.projectId === proj.id);
    return {
      ...proj.toJSON(),
      participationCount: pp.length,
      uniqueEmployees: new Set(pp.map((p) => p.employeeId)).size,
      totalMonths: pp.reduce((s, p) => s + p.totalMonths, 0),
    };
  });

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
  const activeProjects = projects.filter((p) => p.status === 'active').length;

  return {
    client: client.toJSON(),
    projects: projectStats,
    participations: enriched,
    topEmployees,
    stats: {
      totalProjects: projects.length,
      activeProjects,
      totalParticipations: participations.length,
      uniqueEmployees,
    },
  };
};

export const getDashboardSummary = async () => {
  const [
    totalEmployees,
    activeEmployees,
    totalProjects,
    activeProjects,
    totalRoles,
    totalParticipations,
  ] = await Promise.all([
    Employee.count(),
    Employee.count({ where: { isActive: true } }),
    Project.count(),
    Project.count({ where: { status: 'active' } }),
    Role.count(),
    ProjectParticipation.count(),
  ]);

  const projectsByStatus = await Project.findAll({
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
      totalProjects,
      activeProjects,
      totalRoles,
      totalParticipations,
    },
    projectsByStatus,
    employeesByDepartment,
    recentParticipations,
  };
};

export const getFilteredParticipations = async (
  filters: ParticipationFilterQuery
) => {
  const where: Record<string, unknown> = {};
  const employeeWhere: Record<string, unknown> = {};
  const projectWhere: Record<string, unknown> = {};

  if (filters.employeeId) where.employeeId = parseInt(filters.employeeId, 10);
  if (filters.projectId) where.projectId = parseInt(filters.projectId, 10);
  if (filters.roleId) where.roleId = parseInt(filters.roleId, 10);
  if (filters.department) employeeWhere.department = filters.department;
  if (filters.status) projectWhere.status = filters.status;

  if (filters.startDate) {
    where.startDate = { [Op.gte as unknown as string]: filters.startDate };
  }
  if (filters.endDate) {
    where.endDate = {
      [Op.or as unknown as string]: [
        { [Op.lte as unknown as string]: filters.endDate },
        null,
      ],
    };
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
      {
        model: Employee,
        as: 'employee',
        where: Object.keys(employeeWhere).length ? employeeWhere : undefined,
      },
      {
        model: Project,
        as: 'project',
        where: Object.keys(projectWhere).length ? projectWhere : undefined,
      },
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
