import { Request, Response, NextFunction } from 'express';
import * as participationService from '../services/participationService';
import { ParticipationFilterQuery } from '../types';

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = req.query as ParticipationFilterQuery;
    const result = await participationService.getAllParticipations(filters);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const participation = await participationService.getParticipationById(
      parseInt(req.params.id, 10)
    );
    res.json({ success: true, data: participation });
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const participations = await participationService.createParticipations(req.body);
    res.status(201).json({ success: true, data: participations });
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const participation = await participationService.updateParticipation(
      parseInt(req.params.id, 10),
      req.body
    );
    res.json({ success: true, data: participation });
  } catch (err) {
    next(err);
  }
};

export const recalculate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await participationService.recalculateParticipations();
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const bulkPreview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded.' }); return; }
    const result = await participationService.bulkPreview(req.file.buffer);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const bulkConfirm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(400).json({ success: false, message: 'No rows to import.' }); return;
    }
    const result = await participationService.bulkConfirm(rows);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await participationService.deleteParticipation(parseInt(req.params.id, 10));
    res.json({
      success: true,
      message: 'Participation record deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
