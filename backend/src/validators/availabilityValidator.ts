import { body } from 'express-validator';

export const createAvailabilityRules = [
  body('startDate').notEmpty().withMessage('Start date is required.').isISO8601().withMessage('Invalid start date.'),
  body('endDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Invalid end date.'),
  body('notes').optional().trim(),
];

export const updateAvailabilityRules = [
  body('startDate').optional().isISO8601().withMessage('Invalid start date.'),
  body('endDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Invalid end date.'),
  body('notes').optional().trim(),
];
