import { body } from 'express-validator';

export const createRoleRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Role name is required.')
    .isLength({ max: 100 }).withMessage('Role name must not exceed 100 characters.'),

  body('description')
    .optional({ nullable: true })
    .trim(),
];

export const updateRoleRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Role name cannot be empty.')
    .isLength({ max: 100 }).withMessage('Role name must not exceed 100 characters.'),

  body('description')
    .optional({ nullable: true })
    .trim(),
];
