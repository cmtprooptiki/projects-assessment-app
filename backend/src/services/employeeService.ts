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
    data: rows,
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
  return employee;
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
