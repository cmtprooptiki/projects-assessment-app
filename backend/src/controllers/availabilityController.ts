import { Request, Response, NextFunction } from 'express';
import * as availabilityService from '../services/availabilityService';

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    const periods = await availabilityService.getByEmployeeId(employeeId);
    res.json({ success: true, data: periods });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    const { startDate, endDate, notes } = req.body;
    const period = await availabilityService.create(employeeId, { startDate, endDate: endDate || null, notes: notes || null });
    res.status(201).json({ success: true, data: period });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    const id = parseInt(req.params.id, 10);
    const { startDate, endDate, notes } = req.body;
    const data: Record<string, unknown> = {};
    if (startDate !== undefined) data.startDate = startDate;
    if (endDate !== undefined) data.endDate = endDate || null;
    if (notes !== undefined) data.notes = notes || null;
    const period = await availabilityService.update(id, employeeId, data as any);
    res.json({ success: true, data: period });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    const id = parseInt(req.params.id, 10);
    await availabilityService.remove(id, employeeId);
    res.json({ success: true, message: 'Period deleted.' });
  } catch (err) { next(err); }
};
