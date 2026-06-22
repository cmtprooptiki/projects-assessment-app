import { Router } from 'express';
import * as controller from '../controllers/availabilityController';
import { createAvailabilityRules, updateAvailabilityRules } from '../validators/availabilityValidator';
import { validate } from '../middleware/validate';

const router = Router({ mergeParams: true });

router.get('/', controller.getAll);
router.post('/', createAvailabilityRules, validate, controller.create);
router.put('/:id', updateAvailabilityRules, validate, controller.update);
router.delete('/:id', controller.remove);

export default router;
