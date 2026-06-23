import { body } from 'express-validator';

export const createParticipationRules = [
  body('employeeId')
    .notEmpty().withMessage('Employee ID is required.')
    .isInt({ min: 1 }).withMessage('Employee ID must be a positive integer.')
    .toInt(),

  body('projectId')
    .notEmpty().withMessage('Project ID is required.')
    .isInt({ min: 1 }).withMessage('Project ID must be a positive integer.')
    .toInt(),

  body('roleId')
    .notEmpty().withMessage('Role ID is required.')
    .isInt({ min: 1 }).withMessage('Role ID must be a positive integer.')
    .toInt(),

  body('notes')
    .optional({ nullable: true })
    .trim(),
];

export const updateParticipationRules = [
  body('roleId')
    .optional()
    .isInt({ min: 1 }).withMessage('Role ID must be a positive integer.')
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

  body('notes')
    .optional({ nullable: true })
    .trim(),
];
