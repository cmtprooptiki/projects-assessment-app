import { Router } from 'express';
import * as controller from '../controllers/contractController';
import { createContractRules, updateContractRules } from '../validators/contractValidator';
import { validate } from '../middleware/validate';
import { authenticate, requireAdmin } from '../middleware/authenticate';

const router = Router();

router.get('/', controller.getAll);
router.post('/sync', controller.syncFromCashflow);
router.get('/:id', controller.getById);
router.post('/', createContractRules, validate, controller.create);
router.put('/:id', authenticate, requireAdmin, updateContractRules, validate, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);

export default router;
