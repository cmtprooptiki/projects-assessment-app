import { body } from 'express-validator';

export const updateUserRules = [
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('firstName')
    .optional()
    .trim()
    .notEmpty().withMessage('First name cannot be empty.')
    .isLength({ max: 100 }).withMessage('First name must not exceed 100 characters.'),

  body('lastName')
    .optional()
    .trim()
    .notEmpty().withMessage('Last name cannot be empty.')
    .isLength({ max: 100 }).withMessage('Last name must not exceed 100 characters.'),

  body('role')
    .optional()
    .isIn(['admin', 'user']).withMessage('Role must be admin or user.'),

  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
];
