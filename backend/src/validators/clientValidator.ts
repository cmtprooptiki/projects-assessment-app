import { body } from 'express-validator';

export const createClientRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Client name is required.')
    .isLength({ max: 200 }).withMessage('Client name must not exceed 200 characters.'),

  body('industry')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Industry must not exceed 100 characters.'),

  body('contactEmail')
    .optional({ nullable: true })
    .trim()
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('contactPhone')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Phone must not exceed 50 characters.'),

  body('notes')
    .optional({ nullable: true })
    .trim(),
];

export const updateClientRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Client name cannot be empty.')
    .isLength({ max: 200 }).withMessage('Client name must not exceed 200 characters.'),

  body('industry')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Industry must not exceed 100 characters.'),

  body('contactEmail')
    .optional({ nullable: true })
    .trim()
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('contactPhone')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Phone must not exceed 50 characters.'),

  body('notes')
    .optional({ nullable: true })
    .trim(),
];
