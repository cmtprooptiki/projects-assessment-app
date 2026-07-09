import { Op } from 'sequelize';
import { Department } from '../models';
import { AppError } from '../middleware/errorHandler';
import { DepartmentCreationAttributes } from '../models/Department';

const DEPARTMENT_SORT: Record<string, string> = {
  name: 'name',
  description: 'description',
};

export const getAllDepartments = async (filters: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
} = {}) => {
  const { search, page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = filters;
  const offset = (page - 1) * limit;
  const dir = sortOrder === 'desc' ? 'DESC' : 'ASC';
  const field = DEPARTMENT_SORT[sortBy] ?? DEPARTMENT_SORT.name;

  const where: Record<string, unknown> = {};
  if (search) {
    where[Op.or as unknown as string] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Department.findAndCountAll({
    where,
    limit,
    offset,
    order: [[field, dir]],
  });

  return {
    data: rows,
    meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };
};

export const getDepartmentById = async (id: number) => {
  const dept = await Department.findByPk(id);
  if (!dept) throw new AppError('Department not found.', 404);
  return dept;
};

export const createDepartment = async (data: DepartmentCreationAttributes) => {
  const existing = await Department.findOne({ where: { name: data.name } });
  if (existing) throw new AppError('A department with this name already exists.', 409);
  return Department.create(data);
};

export const updateDepartment = async (id: number, data: Partial<DepartmentCreationAttributes>) => {
  const dept = await Department.findByPk(id);
  if (!dept) throw new AppError('Department not found.', 404);

  if (data.name && data.name !== dept.name) {
    const existing = await Department.findOne({ where: { name: data.name } });
    if (existing) throw new AppError('A department with this name already exists.', 409);
  }

  await dept.update(data);
  return dept;
};

export const deleteDepartment = async (id: number) => {
  const dept = await Department.findByPk(id);
  if (!dept) throw new AppError('Department not found.', 404);
  await dept.destroy();
};
