import { Router } from 'express';
import * as controller from '../controllers/dashboardController';

const router = Router();

router.get('/summary', controller.getSummary);
router.get('/participations', controller.getFilteredParticipations);
router.get('/project/:projectId', controller.getProjectDashboard);
router.get('/employee/:employeeId', controller.getEmployeeDashboard);
router.get('/client/:clientId', controller.getClientDashboard);

export default router;
