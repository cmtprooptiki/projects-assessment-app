import { EmployeeHistoryProject } from '../models';
import { AppError } from '../middleware/errorHandler';
import { EmployeeHistoryProjectCreationAttributes } from '../models/EmployeeHistoryProject';

export const getHistoryByEmployee = async (employeeId: number) =>
  EmployeeHistoryProject.findAll({
    where: { employeeId },
    order: [['startDate', 'DESC']],
  });

export const createHistoryProject = async (
  data: Omit<EmployeeHistoryProjectCreationAttributes, 'employeeId'> & { employeeId: number }
) => EmployeeHistoryProject.create(data);

export const updateHistoryProject = async (
  id: number,
  employeeId: number,
  data: Partial<Omit<EmployeeHistoryProjectCreationAttributes, 'employeeId'>>
) => {
  const record = await EmployeeHistoryProject.findOne({ where: { id, employeeId } });
  if (!record) throw new AppError('History project record not found.', 404);
  await record.update(data);
  return record;
};

export const deleteHistoryProject = async (id: number, employeeId: number) => {
  const record = await EmployeeHistoryProject.findOne({ where: { id, employeeId } });
  if (!record) throw new AppError('History project record not found.', 404);
  await record.destroy();
};
