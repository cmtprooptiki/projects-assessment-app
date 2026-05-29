import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as languageService from '../services/languageService';

export const getByEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await languageService.getLanguagesByEmployee(parseInt(req.params.employeeId, 10));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, errors: errors.array() }); return; }
    const record = await languageService.createLanguage({ ...req.body, employeeId: parseInt(req.params.employeeId, 10) });
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, errors: errors.array() }); return; }
    const record = await languageService.updateLanguage(parseInt(req.params.id, 10), parseInt(req.params.employeeId, 10), req.body);
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await languageService.deleteLanguage(parseInt(req.params.id, 10), parseInt(req.params.employeeId, 10));
    res.json({ success: true, message: 'Language record deleted.' });
  } catch (err) { next(err); }
};
