import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { Employee, ProjectParticipation, Project, Role } from '../models';
import { AppError } from '../middleware/errorHandler';
import { EmployeeAttributes, EmployeeCreationAttributes } from '../models/Employee';

const deletePhotoFile = (photoPath: string | null | undefined) => {
  if (!photoPath) return;
  const fullPath = path.join(process.cwd(), photoPath);
  try { if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath); } catch {}
};

const calcYearsOfService = (workStartDate: string | null | undefined, workEndDate: string | null | undefined): number | null => {
  if (!workStartDate) return null;
  const start = new Date(workStartDate);
  const end = workEndDate ? new Date(workEndDate) : new Date();
  let years = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < start.getDate())) years--;
  return Math.max(0, years);
};

export const getAllEmployees = async (filters: {
  department?: string;
  isActive?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { department, isActive, search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (department) where.department = department;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where[Op.or as unknown as string] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Employee.findAndCountAll({
    where,
    limit,
    offset,
    order: [['firstName', 'ASC'], ['lastName', 'ASC']],
  });

  return {
    data: rows.map(e => ({
      ...e.toJSON(),
      yearsOfService: calcYearsOfService(e.workStartDate, e.workEndDate),
    })),
    meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };
};

export const getEmployeeById = async (id: number) => {
  const employee = await Employee.findByPk(id, {
    include: [
      {
        model: ProjectParticipation,
        as: 'participations',
        include: [
          { model: Project, as: 'project' },
          { model: Role, as: 'role' },
        ],
      },
    ],
  });
  if (!employee) throw new AppError('Employee not found.', 404);
  return {
    ...employee.toJSON(),
    yearsOfService: calcYearsOfService(employee.workStartDate, employee.workEndDate),
  };
};

export const createEmployee = async (data: EmployeeCreationAttributes) => {
  const existing = await Employee.findOne({ where: { email: data.email } });
  if (existing) throw new AppError('An employee with this email already exists.', 409);
  return Employee.create(data);
};

export const updateEmployee = async (id: number, data: Partial<EmployeeAttributes>) => {
  const employee = await Employee.findByPk(id);
  if (!employee) throw new AppError('Employee not found.', 404);

  if (data.email && data.email !== employee.email) {
    const existing = await Employee.findOne({ where: { email: data.email } });
    if (existing) throw new AppError('An employee with this email already exists.', 409);
  }

  if ('photo' in data && employee.photo) deletePhotoFile(employee.photo);

  await employee.update(data);
  return employee;
};

export const deleteEmployee = async (id: number) => {
  const employee = await Employee.findByPk(id);
  if (!employee) throw new AppError('Employee not found.', 404);
  if (employee.photo) deletePhotoFile(employee.photo);
  await employee.destroy();
};

// ── Azure AD sync ──────────────────────────────────────────────────────────────

export interface AzureUser {
  id: string;
  givenName?: string | null;
  surname?: string | null;
  mail?: string | null;
  userPrincipalName?: string | null;
  department?: string | null;
  accountEnabled?: boolean | null;
}

export const syncFromAzure = async (user: AzureUser) => {
  const firstName = user.givenName?.trim() || 'Unknown';
  const lastName = user.surname?.trim() || 'Unknown';
  const email = (user.mail || user.userPrincipalName || '').trim();
  const department = user.department?.trim() || 'N/A';
  const isActive = user.accountEnabled ?? true;

  if (!email) return { action: 'skipped', reason: 'no email' };

  const payload = {
    azureId: user.id,
    firstName,
    lastName,
    email,
    department,
    isActive,
  };

  const existing = await Employee.findOne({ where: { azureId: user.id } });
  if (existing) {
    await existing.update(payload);
    return { action: 'updated', employee: existing };
  }

  const byEmail = await Employee.findOne({ where: { email } });
  if (byEmail) {
    await byEmail.update(payload);
    return { action: 'linked', employee: byEmail };
  }

  const created = await Employee.create(payload);
  return { action: 'created', employee: created };
};

export const syncCleanup = async (activeAzureIds: string[]) => {
  const whereCondition = activeAzureIds.length > 0
    ? { azureId: { [Op.and]: [{ [Op.not]: null }, { [Op.notIn]: activeAzureIds }] }, isActive: true }
    : { azureId: { [Op.not]: null }, isActive: true };

  const [updatedCount] = await Employee.update(
    { isActive: false },
    { where: whereCondition }
  );
  return { deactivated: updatedCount };
};
