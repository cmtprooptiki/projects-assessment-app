import { Router } from 'express';
import multer from 'multer';
import * as clientController from '../controllers/clientController';
import { createClientRules, updateClientRules } from '../validators/clientValidator';

const router = Router();

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) cb(null, true);
    else cb(new Error('Only CSV files are allowed.') as any, false);
  },
}).single('file');

router.get('/', clientController.getAll);
router.post('/', createClientRules, clientController.create);
router.post('/import', csvUpload, clientController.importCSV);
router.get('/:id', clientController.getById);
router.put('/:id', updateClientRules, clientController.update);
router.delete('/:id', clientController.remove);

export default router;
