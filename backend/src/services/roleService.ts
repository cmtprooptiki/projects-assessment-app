import { Role } from '../models';
import { AppError } from '../middleware/errorHandler';
import { RoleCreationAttributes } from '../models/Role';

export const getAllRoles = async () => {
  return Role.findAll({ order: [['name', 'ASC']] });
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
