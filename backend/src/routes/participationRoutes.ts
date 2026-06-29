import { Router } from 'express';
import * as controller from '../controllers/participationController';
import {
  createParticipationRules,
  updateParticipationRules,
} from '../validators/participationValidator';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', controller.getAll);
router.post('/recalculate', controller.recalculate);
router.get('/:id', controller.getById);
router.post('/', createParticipationRules, validate, controller.create);
router.put('/:id', updateParticipationRules, validate, controller.update);
router.delete('/:id', controller.remove);

export default router;
