import { Request, Response, NextFunction } from 'express';
import * as roleService from '../services/roleService';

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const roles = await roleService.getAllRoles();
    res.json({ success: true, data: roles });
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
    const role = await roleService.getRoleById(parseInt(req.params.id, 10));
    res.json({ success: true, data: role });
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
    const role = await roleService.createRole(req.body);
    res.status(201).json({ success: true, data: role });
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
    const role = await roleService.updateRole(
      parseInt(req.params.id, 10),
      req.body
    );
    res.json({ success: true, data: role });
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
    await roleService.deleteRole(parseInt(req.params.id, 10));
    res.json({ success: true, message: 'Role deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
