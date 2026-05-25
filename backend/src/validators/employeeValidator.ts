import { body } from 'express-validator';

export const createEmployeeRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required.')
    .isLength({ max: 100 }).withMessage('First name must not exceed 100 characters.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.')
    .isLength({ max: 100 }).withMessage('Last name must not exceed 100 characters.'),
  body('email').trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.').normalizeEmail(),
  body('department').trim().notEmpty().withMessage('Department is required.')
    .isLength({ max: 100 }).withMessage('Department must not exceed 100 characters.'),
  body('isActive').optional().isBoolean({ strict: false }).withMessage('isActive must be a boolean.'),
];

export const updateEmployeeRules = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty.')
    .isLength({ max: 100 }).withMessage('First name must not exceed 100 characters.'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty.')
    .isLength({ max: 100 }).withMessage('Last name must not exceed 100 characters.'),
  body('email').optional().trim().isEmail().withMessage('Must be a valid email address.').normalizeEmail(),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty.')
    .isLength({ max: 100 }).withMessage('Department must not exceed 100 characters.'),
  body('isActive').optional().isBoolean({ strict: false }).withMessage('isActive must be a boolean.'),
];
