import { Router } from 'express';
import { treatmentAnalytics } from '../controllers/analyticsController.js';

const router = Router();
router.get('/treatments', treatmentAnalytics);
export default router;