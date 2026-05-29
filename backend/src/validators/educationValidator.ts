import { body } from 'express-validator';

export const educationRules = [
  body('institutionName').trim().notEmpty().withMessage('Institution name is required.').isLength({ max: 300 }),
  body('degreeTitle').trim().notEmpty().withMessage('Degree title is required.').isLength({ max: 300 }),
  body('specialization').optional().trim().isLength({ max: 200 }),
  body('dateAwarded').optional({ nullable: true }).isISO8601().withMessage('Invalid date format.'),
  body('recognized').optional({ nullable: true }).isIn(['yes', 'no']).withMessage('Recognized must be yes or no.'),
];
