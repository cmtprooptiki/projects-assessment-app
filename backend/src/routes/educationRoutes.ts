import { Router } from 'express';
import * as educationController from '../controllers/educationController';
import { educationRules } from '../validators/educationValidator';
import { authenticate } from '../middleware/authenticate';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', educationController.getByEmployee);
router.post('/', educationRules, educationController.create);
router.put('/:id', educationRules, educationController.update);
router.delete('/:id', educationController.remove);

export default router;
