import { Request, Response, NextFunction } from 'express';
import * as employeeService from '../services/employeeService';

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { department, isActive, search, page, limit } = req.query as Record<string, string>;
    const result = await employeeService.getAllEmployees({
      department, isActive, search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employee = await employeeService.getEmployeeById(parseInt(req.params.id, 10));
    res.json({ success: true, data: employee });
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, department, isActive, fatherName, motherName, dateOfBirth, placeOfBirth, phone, homeAddress, workStartDate, workEndDate } = req.body;
    const photo = req.file ? `/uploads/employees/${req.file.filename}` : undefined;

    const employee = await employeeService.createEmployee({
      firstName, lastName, email, department,
      isActive: isActive === undefined ? true : (isActive === 'true' || isActive === true),
      ...(photo !== undefined && { photo }),
      ...(fatherName && { fatherName }),
      ...(motherName && { motherName }),
      ...(dateOfBirth && { dateOfBirth }),
      ...(placeOfBirth && { placeOfBirth }),
      ...(phone && { phone }),
      ...(homeAddress && { homeAddress }),
      ...(workStartDate && { workStartDate }),
      ...(workEndDate && { workEndDate }),
    });
    res.status(201).json({ success: true, data: employee });
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, department, isActive, clearPhoto, fatherName, motherName, dateOfBirth, placeOfBirth, phone, homeAddress, workStartDate, workEndDate } = req.body;
    const newPhoto = req.file ? `/uploads/employees/${req.file.filename}` : undefined;

    const data: Record<string, unknown> = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (email !== undefined) data.email = email;
    if (department !== undefined) data.department = department;
    if (isActive !== undefined) data.isActive = isActive === 'true' || isActive === true;
    if (newPhoto) data.photo = newPhoto;
    else if (clearPhoto === 'true') data.photo = null;
    if (fatherName !== undefined) data.fatherName = fatherName || null;
    if (motherName !== undefined) data.motherName = motherName || null;
    if (dateOfBirth !== undefined) data.dateOfBirth = dateOfBirth || null;
    if (placeOfBirth !== undefined) data.placeOfBirth = placeOfBirth || null;
    if (phone !== undefined) data.phone = phone || null;
    if (homeAddress !== undefined) data.homeAddress = homeAddress || null;
    if (workStartDate !== undefined) data.workStartDate = workStartDate || null;
    if (workEndDate !== undefined) data.workEndDate = workEndDate || null;

    const employee = await employeeService.updateEmployee(parseInt(req.params.id, 10), data as any);
    res.json({ success: true, data: employee });
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await employeeService.deleteEmployee(parseInt(req.params.id, 10));
    res.json({ success: true, message: 'Employee deleted successfully.' });
  } catch (err) { next(err); }
};

export const syncFromAzure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await employeeService.syncFromAzure(req.body);
    const status = result.action === 'created' ? 201 : 200;
    res.status(status).json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const syncCleanup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { azureIds } = req.body;
    if (!Array.isArray(azureIds)) {
      res.status(400).json({ success: false, message: 'azureIds must be an array' });
      return;
    }
    const result = await employeeService.syncCleanup(azureIds);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};
