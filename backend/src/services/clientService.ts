import { Op } from 'sequelize';
import Client, { ClientCreationAttributes } from '../models/Client';
import Project from '../models/Project';
import { AppError } from '../middleware/errorHandler';

export const getAllClients = async (filters: {
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where[Op.or as unknown as string] = [
      { name: { [Op.like]: `%${search}%` } },
      { industry: { [Op.like]: `%${search}%` } },
      { contactEmail: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Client.findAndCountAll({
    where,
    limit,
    offset,
    order: [['name', 'ASC']],
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

export const getClientById = async (id: number) => {
  const client = await Client.findByPk(id, {
    include: [{ model: Project, as: 'projects' }],
  });
  if (!client) throw new AppError('Client not found.', 404);
  return client;
};

export const createClient = async (data: ClientCreationAttributes) => {
  const existing = await Client.findOne({ where: { name: data.name } });
  if (existing) throw new AppError('A client with this name already exists.', 409);
  return Client.create(data);
};

export const updateClient = async (
  id: number,
  data: Partial<ClientCreationAttributes>
) => {
  const client = await Client.findByPk(id);
  if (!client) throw new AppError('Client not found.', 404);

  if (data.name && data.name !== client.name) {
    const existing = await Client.findOne({ where: { name: data.name } });
    if (existing) throw new AppError('A client with this name already exists.', 409);
  }

  await client.update(data);
  return client;
};

export const deleteClient = async (id: number) => {
  const client = await Client.findByPk(id);
  if (!client) throw new AppError('Client not found.', 404);

  const projectCount = await Project.count({ where: { clientId: id } });
  if (projectCount > 0) {
    throw new AppError(
      `Cannot delete client — ${projectCount} project(s) are assigned to it.`,
      409
    );
  }

  await client.destroy();
};
