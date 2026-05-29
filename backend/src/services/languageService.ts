import Language from '../models/Language';
import { AppError } from '../middleware/errorHandler';

export const getLanguagesByEmployee = async (employeeId: number) =>
  Language.findAll({ where: { employeeId }, order: [['language', 'ASC']] });

export const createLanguage = async (data: {
  employeeId: number;
  language: string;
  degreeTitle?: string;
  level?: string;
}) => Language.create(data);

export const updateLanguage = async (
  id: number,
  employeeId: number,
  data: { language?: string; degreeTitle?: string; level?: string }
) => {
  const record = await Language.findOne({ where: { id, employeeId } });
  if (!record) throw new AppError('Language record not found.', 404);
  await record.update(data);
  return record;
};

export const deleteLanguage = async (id: number, employeeId: number) => {
  const record = await Language.findOne({ where: { id, employeeId } });
  if (!record) throw new AppError('Language record not found.', 404);
  await record.destroy();
};
