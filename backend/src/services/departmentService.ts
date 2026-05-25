import { Department } from '../models';
import { AppError } from '../middleware/errorHandler';
import { DepartmentCreationAttributes } from '../models/Department';

export const getAllDepartments = async () =>
  Department.findAll({ order: [['name', 'ASC']] });

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
