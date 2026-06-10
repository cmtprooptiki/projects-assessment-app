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
      { code: { [Op.like]: `%${search}%` } },
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
  if (data.code) {
    const codeExists = await Client.findOne({ where: { code: data.code } });
    if (codeExists) throw new AppError('A client with this code already exists.', 409);
  }
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

  if (data.code && data.code !== client.code) {
    const codeExists = await Client.findOne({ where: { code: data.code } });
    if (codeExists) throw new AppError('A client with this code already exists.', 409);
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

// ── CSV helpers ────────────────────────────────────────────────────────────────

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cols: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cols.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());
    rows.push(cols);
  }
  return rows;
}

const CODE_RE = /^[\p{L}0-9_-]+$/u;

export const importClients = async (csvBuffer: Buffer) => {
  const rows = parseCSV(csvBuffer.toString('utf-8'));
  if (rows.length < 2) return { created: 0, skipped: 0, errors: [] };

  // Normalise header names
  const headers = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, ''));
  const idx = (col: string) => headers.indexOf(col);
  const nameIdx = idx('name');
  if (nameIdx === -1) throw new AppError('CSV must have a "name" column.', 400);

  const codeIdx = idx('code');
  const industryIdx = idx('industry');
  const emailIdx = idx('contactemail');
  const phoneIdx = idx('contactphone');
  const notesIdx = idx('notes');

  const col = (row: string[], i: number) => (i === -1 ? undefined : row[i] || undefined);

  let created = 0;
  let skipped = 0;
  const errors: { row: number; message: string }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = col(row, nameIdx)?.trim();
    if (!name) { errors.push({ row: i + 1, message: 'Name is required.' }); continue; }

    const code = col(row, codeIdx)?.trim() || undefined;
    if (code && !CODE_RE.test(code)) {
      errors.push({ row: i + 1, message: `Invalid code "${code}".` }); continue;
    }

    const nameTaken = await Client.findOne({ where: { name } });
    if (nameTaken) { skipped++; continue; }

    if (code) {
      const codeTaken = await Client.findOne({ where: { code } });
      if (codeTaken) { errors.push({ row: i + 1, message: `Code "${code}" already in use.` }); continue; }
    }

    await Client.create({
      name,
      code: code ?? null,
      industry: col(row, industryIdx) ?? null,
      contactEmail: col(row, emailIdx) ?? null,
      contactPhone: col(row, phoneIdx) ?? null,
      notes: col(row, notesIdx) ?? null,
    });
    created++;
  }

  return { created, skipped, errors };
};
