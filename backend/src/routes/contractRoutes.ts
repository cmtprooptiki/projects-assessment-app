import { Router } from 'express';
import * as controller from '../controllers/contractController';
import { createContractRules, updateContractRules } from '../validators/contractValidator';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', controller.getAll);
router.post('/sync', controller.syncFromCashflow);
router.get('/:id', controller.getById);
router.post('/', createContractRules, validate, controller.create);
router.put('/:id', updateContractRules, validate, controller.update);
router.delete('/:id', controller.remove);

export default router;
