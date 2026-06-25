import { Request, Response, NextFunction } from 'express';
import { generateCVBuffer } from '../services/cvService';
import Employee from '../models/Employee';

export const exportCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employeeId = parseInt(req.params.employeeId, 10);
    if (isNaN(employeeId)) { res.status(400).json({ success: false, message: 'Invalid employee ID' }); return; }

    const employee = await Employee.findByPk(employeeId);
    if (!employee) { res.status(404).json({ success: false, message: 'Employee not found' }); return; }

    const buffer = await generateCVBuffer(employeeId);
    const filename = `CV_${employee.lastName}_${employee.firstName}.docx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Content-Length': String(buffer.length),
    });
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};
