import { Router } from 'express';
import { chat } from '../controllers/assistantController';

const router = Router();
router.post('/', chat);
export default router;
