import { Request, Response, NextFunction } from 'express';
import * as contractService from '../services/contractService';

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, clientId, projectId, search, page, limit } = req.query as Record<string, string>;
    const result = await contractService.getAllContracts({
      status, clientId, projectId, search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contract = await contractService.getContractById(parseInt(req.params.id, 10));
    res.json({ success: true, data: contract });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contract = await contractService.createContract(req.body);
    res.status(201).json({ success: true, data: contract });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contract = await contractService.updateContract(parseInt(req.params.id, 10), req.body);
    res.json({ success: true, data: contract });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await contractService.deleteContract(parseInt(req.params.id, 10));
    res.json({ success: true, message: 'Contract deleted successfully.' });
  } catch (err) { next(err); }
};

export const syncFromCashflow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await contractService.syncFromCashflow(req.body);
    const status = result.action === 'created' ? 201 : 200;
    res.status(status).json({ success: true, data: result });
  } catch (err) { next(err); }
};
