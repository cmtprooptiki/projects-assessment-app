import { Router } from 'express';
import * as controller from '../controllers/roleController';
import { createRoleRules, updateRoleRules } from '../validators/roleValidator';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', createRoleRules, validate, controller.create);
router.put('/:id', updateRoleRules, validate, controller.update);
router.delete('/:id', controller.remove);

export default router;
