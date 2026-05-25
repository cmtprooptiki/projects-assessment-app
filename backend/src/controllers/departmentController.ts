import { Request, Response, NextFunction } from 'express';
import * as departmentService from '../services/departmentService';

export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.json({ success: true, data: departments });
  } catch (err) { next(err); }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dept = await departmentService.getDepartmentById(parseInt(req.params.id, 10));
    res.json({ success: true, data: dept });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dept = await departmentService.createDepartment(req.body);
    res.status(201).json({ success: true, data: dept });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dept = await departmentService.updateDepartment(parseInt(req.params.id, 10), req.body);
    res.json({ success: true, data: dept });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await departmentService.deleteDepartment(parseInt(req.params.id, 10));
    res.json({ success: true, message: 'Department deleted successfully.' });
  } catch (err) { next(err); }
};
