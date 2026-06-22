import { body } from 'express-validator';

const validStatuses = ['Υπογεγραμμένο', 'Ολοκληρωμένο', 'Αποπληρωμένο'];

export const createContractRules = [
  body('name').trim().notEmpty().withMessage('Contract name is required.').isLength({ max: 200 }),
  body('code').trim().notEmpty().withMessage('Contract code is required.').isLength({ max: 50 })
    .matches(/^[\p{L}0-9_\/\-]+$/u).withMessage('Invalid contract code format.'),
  body('description').optional({ nullable: true }).trim(),
  body('clientId').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('projectId').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('startDate').notEmpty().withMessage('Start date is required.').isDate({ format: 'YYYY-MM-DD' }),
  body('endDate').optional({ nullable: true }).isDate({ format: 'YYYY-MM-DD' }),
  body('status').optional().isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}.`),
  body('budget').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('confirmationOfGoodPerformance').optional({ nullable: true }).trim().isLength({ max: 500 }),
];

export const updateContractRules = [
  body('name').optional().trim().notEmpty().withMessage('Contract name cannot be empty.').isLength({ max: 200 }),
  body('code').optional().trim().notEmpty().isLength({ max: 50 })
    .matches(/^[\p{L}0-9_\/\-]+$/u).withMessage('Invalid contract code format.'),
  body('description').optional({ nullable: true }).trim(),
  body('clientId').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('projectId').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('startDate').optional().isDate({ format: 'YYYY-MM-DD' }),
  body('endDate').optional({ nullable: true }).isDate({ format: 'YYYY-MM-DD' }),
  body('status').optional().isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}.`),
  body('budget').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('confirmationOfGoodPerformance').optional({ nullable: true }).trim().isLength({ max: 500 }),
];
