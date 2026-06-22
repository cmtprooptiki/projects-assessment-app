import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/projectService';

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clientId, search, page, limit } = req.query as Record<string, string>;
    const result = await projectService.getAllProjects({
      clientId, search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await projectService.getProjectById(parseInt(req.params.id, 10));
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, acronym, description, clientId } = req.body;
    const project = await projectService.createProject({ name, acronym, description, clientId: clientId || null });
    res.status(201).json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, acronym, description, clientId } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (acronym !== undefined) data.acronym = acronym;
    if (description !== undefined) data.description = description || null;
    if (clientId !== undefined) data.clientId = clientId || null;
    const project = await projectService.updateProject(parseInt(req.params.id, 10), data as any);
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await projectService.deleteProject(parseInt(req.params.id, 10));
    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) { next(err); }
};

export const linkContracts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = parseInt(req.params.id, 10);
    const { contractIds } = req.body;
    const project = await projectService.linkContractsToProject(projectId, Array.isArray(contractIds) ? contractIds : []);
    res.json({ success: true, data: project });
  } catch (err) { next(err); }
};
