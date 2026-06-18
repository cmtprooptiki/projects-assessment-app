import { body } from 'express-validator';

const personalRules = (optional = false) => {
  const opt = (rule: ReturnType<typeof body>) => optional ? rule.optional() : rule;
  return [
    body('fatherName').optional().trim().isLength({ max: 100 }),
    body('motherName').optional().trim().isLength({ max: 100 }),
    body('dateOfBirth').optional({ nullable: true }).isISO8601().withMessage('Invalid date of birth.'),
    body('placeOfBirth').optional().trim().isLength({ max: 200 }),
    body('phone').optional().trim().isLength({ max: 50 }),
    body('homeAddress').optional().trim(),
    body('workStartDate').optional({ nullable: true }).isISO8601().withMessage('Invalid work start date.'),
    body('workEndDate').optional({ nullable: true }).isISO8601().withMessage('Invalid work end date.'),
  ];
};

export const createEmployeeRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required.').isLength({ max: 100 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required.').isLength({ max: 100 }),
  body('email').trim().notEmpty().withMessage('Email is required.').isEmail().normalizeEmail(),
  body('department').trim().notEmpty().withMessage('Department is required.').isLength({ max: 100 }),
  body('isActive').optional().isBoolean({ strict: false }),
  ...personalRules(),
];

export const updateEmployeeRules = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty.').isLength({ max: 100 }),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty.').isLength({ max: 100 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty.').isLength({ max: 100 }),
  body('isActive').optional().isBoolean({ strict: false }),
  ...personalRules(true),
];
