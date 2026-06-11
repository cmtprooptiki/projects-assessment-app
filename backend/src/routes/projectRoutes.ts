import { Router } from 'express';
import * as controller from '../controllers/projectController';
import { createProjectRules, updateProjectRules } from '../validators/projectValidator';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', controller.getAll);
router.post('/sync', controller.syncFromCashflow);
router.get('/:id', controller.getById);
router.post('/', createProjectRules, validate, controller.create);
router.put('/:id', updateProjectRules, validate, controller.update);
router.delete('/:id', controller.remove);

export default router;
