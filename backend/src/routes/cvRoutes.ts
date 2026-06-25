import { Router } from 'express';
import { exportCV } from '../controllers/cvController';

const router = Router();

router.get('/:employeeId', exportCV);

export default router;
