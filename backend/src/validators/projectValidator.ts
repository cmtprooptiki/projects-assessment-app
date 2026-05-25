import { body } from 'express-validator';

const validStatuses = ['active', 'completed', 'on_hold', 'cancelled'];

export const createProjectRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required.')
    .isLength({ max: 200 }).withMessage('Project name must not exceed 200 characters.'),

  body('code')
    .trim()
    .notEmpty().withMessage('Project code is required.')
    .isLength({ max: 50 }).withMessage('Project code must not exceed 50 characters.')
    .matches(/^[A-Z0-9_-]+$/i).withMessage('Project code can only contain letters, numbers, hyphens, and underscores.'),

  body('description')
    .optional({ nullable: true })
    .trim(),

  body('clientId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Client ID must be a positive integer.')
    .toInt(),

  body('startDate')
    .notEmpty().withMessage('Start date is required.')
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Start date must be a valid date (YYYY-MM-DD).'),

  body('endDate')
    .optional({ nullable: true })
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('End date must be a valid date (YYYY-MM-DD).')
    .custom((value, { req }) => {
      if (value && req.body.startDate && value < req.body.startDate) {
        throw new Error('End date must be after start date.');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}.`),
];

export const updateProjectRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Project name cannot be empty.')
    .isLength({ max: 200 }).withMessage('Project name must not exceed 200 characters.'),

  body('code')
    .optional()
    .trim()
    .notEmpty().withMessage('Project code cannot be empty.')
    .isLength({ max: 50 }).withMessage('Project code must not exceed 50 characters.')
    .matches(/^[A-Z0-9_-]+$/i).withMessage('Project code can only contain letters, numbers, hyphens, and underscores.'),

  body('description')
    .optional({ nullable: true })
    .trim(),

  body('clientId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Client ID must be a positive integer.')
    .toInt(),

  body('startDate')
    .optional()
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('Start date must be a valid date (YYYY-MM-DD).'),

  body('endDate')
    .optional({ nullable: true })
    .isDate({ format: 'YYYY-MM-DD' }).withMessage('End date must be a valid date (YYYY-MM-DD).')
    .custom((value, { req }) => {
      const start = req.body.startDate;
      if (value && start && value < start) {
        throw new Error('End date must be after start date.');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}.`),
];
