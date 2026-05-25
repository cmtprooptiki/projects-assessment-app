import { Router } from 'express';
import * as authController from '../controllers/authController';
import { registerRules, loginRules } from '../validators/authValidator';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/register', registerRules, authController.register);
router.post('/login', loginRules, authController.login);
router.get('/me', authenticate, authController.me);

export default router;
