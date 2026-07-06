import { Router } from 'express';
import * as userController from '../controllers/userController';
import { createUserRules, updateUserRules } from '../validators/userValidator';
import { authenticate, requireAdmin } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', userController.getAll);
router.post('/', createUserRules, userController.create);
router.get('/:id', userController.getById);
router.put('/:id', updateUserRules, userController.update);
router.delete('/:id', userController.remove);

export default router;
