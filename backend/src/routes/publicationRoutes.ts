import { Router } from 'express';
import { body } from 'express-validator';
import * as controller from '../controllers/publicationController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';

const router = Router({ mergeParams: true });

router.use(authenticate);

const rules = [
  body('text').trim().notEmpty().withMessage('Publication text is required.'),
];

router.get('/', controller.getByEmployee);
router.post('/', rules, validate, controller.create);
router.put('/:id', rules, validate, controller.update);
router.delete('/:id', controller.remove);

export default router;
