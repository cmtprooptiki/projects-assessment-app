import { Router } from 'express';
import * as languageController from '../controllers/languageController';
import { languageRules } from '../validators/languageValidator';
import { authenticate } from '../middleware/authenticate';

const router = Router({ mergeParams: true });
router.use(authenticate);

router.get('/', languageController.getByEmployee);
router.post('/', languageRules, languageController.create);
router.put('/:id', languageRules, languageController.update);
router.delete('/:id', languageController.remove);

export default router;
