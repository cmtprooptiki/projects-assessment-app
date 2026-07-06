import { EmployeePublication } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getPublicationsByEmployee = async (employeeId: number) =>
  EmployeePublication.findAll({
    where: { employeeId },
    order: [['createdAt', 'ASC']],
  });

export const createPublication = async (employeeId: number, text: string) =>
  EmployeePublication.create({ employeeId, text });

export const updatePublication = async (id: number, employeeId: number, text: string) => {
  const record = await EmployeePublication.findOne({ where: { id, employeeId } });
  if (!record) throw new AppError('Publication not found.', 404);
  await record.update({ text });
  return record;
};

export const deletePublication = async (id: number, employeeId: number) => {
  const record = await EmployeePublication.findOne({ where: { id, employeeId } });
  if (!record) throw new AppError('Publication not found.', 404);
  await record.destroy();
};
