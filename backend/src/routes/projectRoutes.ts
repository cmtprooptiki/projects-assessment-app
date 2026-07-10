import { Router } from 'express';
import * as controller from '../controllers/projectController';
import { createProjectRules, updateProjectRules } from '../validators/projectValidator';
import { validate } from '../middleware/validate';
import { authenticate, requireAdmin } from '../middleware/authenticate';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', createProjectRules, validate, controller.create);
router.put('/:id', updateProjectRules, validate, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);
router.patch('/:id/contracts', controller.linkContracts);

export default router;
