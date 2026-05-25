import { Router } from 'express';
import * as userController from '../controllers/userController';
import { updateUserRules } from '../validators/userValidator';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id', updateUserRules, userController.update);
router.delete('/:id', userController.remove);

export default router;
