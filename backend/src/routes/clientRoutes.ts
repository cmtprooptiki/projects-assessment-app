import { Router } from 'express';
import * as clientController from '../controllers/clientController';
import { createClientRules, updateClientRules } from '../validators/clientValidator';

const router = Router();

router.get('/', clientController.getAll);
router.get('/:id', clientController.getById);
router.post('/', createClientRules, clientController.create);
router.put('/:id', updateClientRules, clientController.update);
router.delete('/:id', clientController.remove);

export default router;
