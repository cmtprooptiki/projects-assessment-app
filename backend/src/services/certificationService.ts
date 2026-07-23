import { EmployeeCertification } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getCertificationsByEmployee = async (employeeId: number) =>
  EmployeeCertification.findAll({
    where: { employeeId },
    order: [['createdAt', 'ASC']],
  });

export const createCertification = async (employeeId: number, text: string) =>
  EmployeeCertification.create({ employeeId, text });

export const updateCertification = async (id: number, employeeId: number, text: string) => {
  const record = await EmployeeCertification.findOne({ where: { id, employeeId } });
  if (!record) throw new AppError('Certification not found.', 404);
  await record.update({ text });
  return record;
};

export const deleteCertification = async (id: number, employeeId: number) => {
  const record = await EmployeeCertification.findOne({ where: { id, employeeId } });
  if (!record) throw new AppError('Certification not found.', 404);
  await record.destroy();
};
