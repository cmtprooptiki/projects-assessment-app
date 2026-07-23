import { Request, Response, NextFunction } from 'express';
import * as certificationService from '../services/certificationService';

export const getByEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await certificationService.getCertificationsByEmployee(parseInt(req.params.employeeId, 10));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await certificationService.createCertification(
      parseInt(req.params.employeeId, 10),
      req.body.text
    );
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await certificationService.updateCertification(
      parseInt(req.params.id, 10),
      parseInt(req.params.employeeId, 10),
      req.body.text
    );
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await certificationService.deleteCertification(
      parseInt(req.params.id, 10),
      parseInt(req.params.employeeId, 10)
    );
    res.json({ success: true, message: 'Certification deleted.' });
  } catch (err) { next(err); }
};
