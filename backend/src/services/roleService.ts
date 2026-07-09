import { Op } from 'sequelize';
import { Role } from '../models';
import { AppError } from '../middleware/errorHandler';
import { RoleCreationAttributes } from '../models/Role';

const ROLE_SORT: Record<string, string> = {
  name: 'name',
  description: 'description',
};

export const getAllRoles = async (filters: {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
} = {}) => {
  const { search, page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = filters;
  const offset = (page - 1) * limit;
  const dir = sortOrder === 'desc' ? 'DESC' : 'ASC';
  const field = ROLE_SORT[sortBy] ?? ROLE_SORT.name;

  const where: Record<string, unknown> = {};
  if (search) {
    where[Op.or as unknown as string] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Role.findAndCountAll({
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

export const getRoleById = async (id: number) => {
  const role = await Role.findByPk(id);
  if (!role) {
    throw new AppError('Role not found.', 404);
  }
  return role;
};

export const createRole = async (data: RoleCreationAttributes) => {
  const existing = await Role.findOne({ where: { name: data.name } });
  if (existing) {
    throw new AppError('A role with this name already exists.', 409);
  }

  return Role.create(data);
};

export const updateRole = async (
  id: number,
  data: Partial<RoleCreationAttributes>
) => {
  const role = await Role.findByPk(id);
  if (!role) {
    throw new AppError('Role not found.', 404);
  }

  if (data.name && data.name !== role.name) {
    const existing = await Role.findOne({ where: { name: data.name } });
    if (existing) {
      throw new AppError('A role with this name already exists.', 409);
    }
  }

  await role.update(data);
  return role;
};

export const deleteRole = async (id: number) => {
  const role = await Role.findByPk(id);
  if (!role) {
    throw new AppError('Role not found.', 404);
  }

  await role.destroy();
};
