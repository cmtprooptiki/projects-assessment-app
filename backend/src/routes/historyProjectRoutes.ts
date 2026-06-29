import { Router } from 'express';
import { body } from 'express-validator';
import * as controller from '../controllers/historyProjectController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

const router = Router({ mergeParams: true });

router.use(authenticate);

const rules = [
  body('projectName').trim().notEmpty().withMessage('Project name is required.').isLength({ max: 300 }),
  body('role').optional({ nullable: true }).trim().isLength({ max: 200 }),
  body('employerName').optional({ nullable: true }).trim().isLength({ max: 200 }),
  body('startDate').notEmpty().withMessage('Start date is required.').isISO8601(),
  body('endDate').optional({ nullable: true }).isISO8601(),
  body('description').optional({ nullable: true }).trim(),
];

router.get('/', controller.getByEmployee);
router.post('/', rules, validate, controller.create);
router.put('/:id', rules, validate, controller.update);
router.delete('/:id', controller.remove);

export default router;
