import { body } from 'express-validator';

export const createProjectRules = [
  body('name').trim().notEmpty().withMessage('Project name is required.').isLength({ max: 200 }),
  body('acronym').trim().notEmpty().withMessage('Acronym is required.').isLength({ max: 50 }),
  body('description').optional({ nullable: true }).trim(),
  body('clientId').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
];

export const updateProjectRules = [
  body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty.').isLength({ max: 200 }),
  body('acronym').optional().trim().notEmpty().withMessage('Acronym cannot be empty.').isLength({ max: 50 }),
  body('description').optional({ nullable: true }).trim(),
  body('clientId').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
];
