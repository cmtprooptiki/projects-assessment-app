import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as historyProjectService from '../services/historyProjectService';

export const getByEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await historyProjectService.getHistoryByEmployee(parseInt(req.params.employeeId, 10));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
      return;
    }
    const record = await historyProjectService.createHistoryProject({
      ...req.body,
      employeeId: parseInt(req.params.employeeId, 10),
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
      return;
    }
    const record = await historyProjectService.updateHistoryProject(
      parseInt(req.params.id, 10),
      parseInt(req.params.employeeId, 10),
      req.body
    );
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await historyProjectService.deleteHistoryProject(
      parseInt(req.params.id, 10),
      parseInt(req.params.employeeId, 10)
    );
    res.json({ success: true, message: 'History project record deleted.' });
  } catch (err) { next(err); }
};
