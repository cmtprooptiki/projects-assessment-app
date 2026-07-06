import { Request, Response, NextFunction } from 'express';
import * as publicationService from '../services/publicationService';

export const getByEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await publicationService.getPublicationsByEmployee(parseInt(req.params.employeeId, 10));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await publicationService.createPublication(
      parseInt(req.params.employeeId, 10),
      req.body.text
    );
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await publicationService.updatePublication(
      parseInt(req.params.id, 10),
      parseInt(req.params.employeeId, 10),
      req.body.text
    );
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await publicationService.deletePublication(
      parseInt(req.params.id, 10),
      parseInt(req.params.employeeId, 10)
    );
    res.json({ success: true, message: 'Publication deleted.' });
  } catch (err) { next(err); }
};
