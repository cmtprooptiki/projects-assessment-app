import { body } from 'express-validator';

export const languageRules = [
  body('language').trim().notEmpty().withMessage('Language is required.').isLength({ max: 100 }),
  body('degreeTitle').optional().trim().isLength({ max: 300 }),
  body('level').optional().trim().isLength({ max: 100 }),
];
