import { Router } from 'express';
import * as controller from '../controllers/employeeController';
import { createEmployeeRules, updateEmployeeRules } from '../validators/employeeValidator';
import { validate } from '../middleware/validate';
import { uploadEmployeePhoto } from '../middleware/upload';

const router = Router();

router.get('/', controller.getAll);
router.post('/sync', controller.syncFromAzure);
router.post('/sync/cleanup', controller.syncCleanup);
router.get('/:id', controller.getById);
router.post('/', uploadEmployeePhoto, createEmployeeRules, validate, controller.create);
router.put('/:id', uploadEmployeePhoto, updateEmployeeRules, validate, controller.update);
router.delete('/:id', controller.remove);

export default router;
