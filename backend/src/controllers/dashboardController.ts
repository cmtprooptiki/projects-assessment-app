import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboardService';
import { ParticipationFilterQuery } from '../types';

export const getProjectDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await dashboardService.getProjectDashboard(
      parseInt(req.params.projectId, 10)
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getEmployeeDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await dashboardService.getEmployeeDashboard(
      parseInt(req.params.employeeId, 10)
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getClientDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await dashboardService.getClientDashboard(
      parseInt(req.params.clientId, 10)
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await dashboardService.getDashboardSummary();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getFilteredParticipations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters = req.query as ParticipationFilterQuery;
    const result = await dashboardService.getFilteredParticipations(filters);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
