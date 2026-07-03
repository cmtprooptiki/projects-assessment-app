import multer from 'multer';
import path from 'path';
import fs from 'fs';

const dir = path.join(process.cwd(), 'uploads', 'employees');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `emp_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

export const uploadEmployeePhoto = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.') as any, false);
  },
}).single('photo');

export const uploadImportFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype.includes('spreadsheet') ||
      file.mimetype.includes('excel') ||
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/csv' ||
      file.originalname.toLowerCase().endsWith('.xlsx') ||
      file.originalname.toLowerCase().endsWith('.xls') ||
      file.originalname.toLowerCase().endsWith('.csv');
    if (ok) cb(null, true);
    else cb(new Error('Only Excel (.xlsx/.xls) or CSV files are allowed.') as any, false);
  },
}).single('file');
