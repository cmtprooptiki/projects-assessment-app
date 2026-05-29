import { Op } from 'sequelize';
import { ProjectParticipation, Employee, Project, Role } from '../models';
import { AppError } from '../middleware/errorHandler';
import { ProjectParticipationCreationAttributes } from '../models/ProjectParticipation';
import { ParticipationFilterQuery } from '../types';

const validateDatesAgainstProject = (
  startDate: string,
  endDate: string | null,
  project: Project
) => {
  const today = new Date().toISOString().slice(0, 10);
  const projectStart = project.startDate;
  const projectEnd = project.endDate ?? today;

  if (startDate < projectStart) {
    throw new AppError(
      `Start date cannot be before the project start date (${projectStart}).`,
      422
    );
  }
  if (startDate > projectEnd) {
    throw new AppError(
      `Start date cannot be after the project end date (${projectEnd}).`,
      422
    );
  }
  if (endDate) {
    if (endDate < projectStart) {
      throw new AppError(
        `End date cannot be before the project start date (${projectStart}).`,
        422
      );
    }
    if (endDate > projectEnd) {
      throw new AppError(
        `End date cannot be after the project end date (${projectEnd}).`,
        422
      );
    }
  }
};

const buildParticipationWhere = (filters: ParticipationFilterQuery) => {
  const where: Record<string, unknown> = {};
  const employeeWhere: Record<string, unknown> = {};
  const projectWhere: Record<string, unknown> = {};

  if (filters.employeeId) where.employeeId = parseInt(filters.employeeId, 10);
  if (filters.projectId) where.projectId = parseInt(filters.projectId, 10);
  if (filters.roleId) where.roleId = parseInt(filters.roleId, 10);
  if (filters.department) employeeWhere.department = filters.department;
  if (filters.status) projectWhere.status = filters.status;

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

  return { where, employeeWhere, projectWhere };
};

export const getAllParticipations = async (filters: ParticipationFilterQuery) => {
  const page = parseInt(filters.page || '1', 10);
  const limit = parseInt(filters.limit || '20', 10);
  const offset = (page - 1) * limit;

  const { where, employeeWhere, projectWhere } = buildParticipationWhere(filters);

  const { count, rows } = await ProjectParticipation.findAndCountAll({
    where,
    include: [
      { model: Employee, as: 'employee', where: Object.keys(employeeWhere).length ? employeeWhere : undefined },
      { model: Project, as: 'project', where: Object.keys(projectWhere).length ? projectWhere : undefined },
      { model: Role, as: 'role' },
    ],
    limit,
    offset,
    order: [['startDate', 'DESC']],
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

export const getParticipationById = async (id: number) => {
  const participation = await ProjectParticipation.findByPk(id, {
    include: [
      { model: Employee, as: 'employee' },
      { model: Project, as: 'project' },
      { model: Role, as: 'role' },
    ],
  });

  if (!participation) {
    throw new AppError('Participation record not found.', 404);
  }

  return participation;
};

export const createParticipation = async (
  data: ProjectParticipationCreationAttributes
) => {
  const [employee, project, role] = await Promise.all([
    Employee.findByPk(data.employeeId),
    Project.findByPk(data.projectId),
    Role.findByPk(data.roleId),
  ]);

  if (!employee) throw new AppError('Employee not found.', 404);
  if (!project) throw new AppError('Project not found.', 404);
  if (!role) throw new AppError('Role not found.', 404);

  validateDatesAgainstProject(data.startDate, data.endDate ?? null, project);

  const participation = await ProjectParticipation.create(data);

  return ProjectParticipation.findByPk(participation.id, {
    include: [
      { model: Employee, as: 'employee' },
      { model: Project, as: 'project' },
      { model: Role, as: 'role' },
    ],
  });
};

export const updateParticipation = async (
  id: number,
  data: Partial<ProjectParticipationCreationAttributes>
) => {
  const participation = await ProjectParticipation.findByPk(id);
  if (!participation) {
    throw new AppError('Participation record not found.', 404);
  }

  if (data.employeeId) {
    const employee = await Employee.findByPk(data.employeeId);
    if (!employee) throw new AppError('Employee not found.', 404);
  }
  let resolvedProject: Project | null = null;
  if (data.projectId) {
    resolvedProject = await Project.findByPk(data.projectId);
    if (!resolvedProject) throw new AppError('Project not found.', 404);
  }
  if (data.roleId) {
    const role = await Role.findByPk(data.roleId);
    if (!role) throw new AppError('Role not found.', 404);
  }

  // If dates are being updated, validate against the project's range
  const effectiveStartDate = data.startDate ?? participation.startDate;
  const effectiveEndDate = 'endDate' in data ? (data.endDate ?? null) : participation.endDate;
  const projectForValidation = resolvedProject ?? await Project.findByPk(participation.projectId);
  if (projectForValidation && (data.startDate || 'endDate' in data)) {
    validateDatesAgainstProject(effectiveStartDate, effectiveEndDate, projectForValidation);
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
  if (!participation) {
    throw new AppError('Participation record not found.', 404);
  }

  await participation.destroy();
};
