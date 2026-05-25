import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import * as clientService from '../services/clientService';

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, page, limit } = req.query as Record<string, string>;
    const result = await clientService.getAllClients({
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const client = await clientService.getClientById(parseInt(req.params.id, 10));
    res.json({ success: true, data: client });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
      return;
    }
    const client = await clientService.createClient(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
      return;
    }
    const client = await clientService.updateClient(parseInt(req.params.id, 10), req.body);
    res.json({ success: true, data: client });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await clientService.deleteClient(parseInt(req.params.id, 10));
    res.json({ success: true, message: 'Client deleted successfully.' });
  } catch (err) { next(err); }
};
