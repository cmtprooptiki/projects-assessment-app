import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import clientRoutes from './clientRoutes';
import employeeRoutes from './employeeRoutes';
import projectRoutes from './projectRoutes';
import roleRoutes from './roleRoutes';
import departmentRoutes from './departmentRoutes';
import participationRoutes from './participationRoutes';
import dashboardRoutes from './dashboardRoutes';
import educationRoutes from './educationRoutes';
import languageRoutes from './languageRoutes';
import availabilityRoutes from './availabilityRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/employees', employeeRoutes);
router.use('/projects', projectRoutes);
router.use('/roles', roleRoutes);
router.use('/departments', departmentRoutes);
router.use('/participations', participationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/employees/:employeeId/education', educationRoutes);
router.use('/employees/:employeeId/languages', languageRoutes);
router.use('/employees/:employeeId/availability', availabilityRoutes);

export default router;
