import { EmployeeAvailabilityPeriod } from '../models';
import { AppError } from '../middleware/errorHandler';

export const getByEmployeeId = async (employeeId: number) => {
  return EmployeeAvailabilityPeriod.findAll({
    where: { employeeId },
    order: [['startDate', 'ASC']],
  });
};

export const create = async (employeeId: number, data: { startDate: string; endDate?: string | null; notes?: string | null }) => {
  return EmployeeAvailabilityPeriod.create({ employeeId, ...data });
};

export const update = async (id: number, employeeId: number, data: { startDate?: string; endDate?: string | null; notes?: string | null }) => {
  const period = await EmployeeAvailabilityPeriod.findOne({ where: { id, employeeId } });
  if (!period) throw new AppError('Availability period not found.', 404);
  await period.update(data);
  return period;
};

export const remove = async (id: number, employeeId: number) => {
  const period = await EmployeeAvailabilityPeriod.findOne({ where: { id, employeeId } });
  if (!period) throw new AppError('Availability period not found.', 404);
  await period.destroy();
};

export const calcYearsOfService = (periods: Array<{ startDate: string; endDate?: string | null }>): number | null => {
  if (!periods || periods.length === 0) return null;
  const today = new Date();
  let totalMs = 0;
  for (const p of periods) {
    const start = new Date(p.startDate + 'T00:00:00');
    const end = p.endDate ? new Date(p.endDate + 'T00:00:00') : today;
    totalMs += Math.max(0, end.getTime() - start.getTime());
  }
  return Math.floor(totalMs / (365.25 * 24 * 60 * 60 * 1000));
};
