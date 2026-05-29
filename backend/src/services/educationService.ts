import Education from '../models/Education';
import { AppError } from '../middleware/errorHandler';
import type { RecognizedValue } from '../models/Education';

export const getEducationByEmployee = async (employeeId: number) => {
  return Education.findAll({
    where: { employeeId },
    order: [['dateAwarded', 'DESC'], ['createdAt', 'DESC']],
  });
};

export const createEducation = async (data: {
  employeeId: number;
  institutionName: string;
  degreeTitle: string;
  specialization?: string;
  dateAwarded?: string;
  recognized?: RecognizedValue;
}) => {
  return Education.create(data);
};

export const updateEducation = async (
  id: number,
  employeeId: number,
  data: {
    institutionName?: string;
    degreeTitle?: string;
    specialization?: string;
    dateAwarded?: string;
    recognized?: RecognizedValue | null;
  }
) => {
  const record = await Education.findOne({ where: { id, employeeId } });
  if (!record) throw new AppError('Education record not found.', 404);
  await record.update(data);
  return record;
};

export const deleteEducation = async (id: number, employeeId: number) => {
  const record = await Education.findOne({ where: { id, employeeId } });
  if (!record) throw new AppError('Education record not found.', 404);
  await record.destroy();
};
