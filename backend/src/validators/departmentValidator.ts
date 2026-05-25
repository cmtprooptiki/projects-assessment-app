import { body } from 'express-validator';

export const createDepartmentRules = [
  body('name').trim().notEmpty().withMessage('Department name is required.')
    .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters.'),
  body('description').optional().trim(),
];

export const updateDepartmentRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.')
    .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters.'),
  body('description').optional().trim(),
];
