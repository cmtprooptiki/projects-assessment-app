import argon2 from 'argon2';
import { Op } from 'sequelize';
import User, { UserRole } from '../models/User';
import { AppError } from '../middleware/errorHandler';

const sanitize = (user: User) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getAllUsers = async (filters: {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { role, search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (role) where.role = role;
  if (search) {
    where[Op.or as unknown as string] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    limit,
    offset,
    order: [['firstName', 'ASC'], ['lastName', 'ASC']],
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

export const getUserById = async (id: number) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
  });
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

export const updateUser = async (
  id: number,
  data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    password?: string;
  }
) => {
  const user = await User.findByPk(id);
  if (!user) throw new AppError('User not found.', 404);

  if (data.email && data.email !== user.email) {
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) throw new AppError('A user with this email already exists.', 409);
  }

  const updateData: Record<string, unknown> = { ...data };

  if (data.password) {
    updateData.password = await argon2.hash(data.password);
  } else {
    delete updateData.password;
  }

  await user.update(updateData);
  return sanitize(user);
};

export const deleteUser = async (id: number) => {
  const user = await User.findByPk(id);
  if (!user) throw new AppError('User not found.', 404);
  await user.destroy();
};
