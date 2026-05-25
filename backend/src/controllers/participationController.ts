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
    const participation = await participationService.createParticipation(
      req.body
    );
    res.status(201).json({ success: true, data: participation });
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
