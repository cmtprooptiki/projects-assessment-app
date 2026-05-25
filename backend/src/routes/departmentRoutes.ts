import { Router } from 'express';
import * as controller from '../controllers/departmentController';
import { createDepartmentRules, updateDepartmentRules } from '../validators/departmentValidator';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', createDepartmentRules, validate, controller.create);
router.put('/:id', updateDepartmentRules, validate, controller.update);
router.delete('/:id', controller.remove);

export default router;
