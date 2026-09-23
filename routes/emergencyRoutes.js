import { Router } from 'express';
import { createEmergencyRequest } from '../controllers/emergencyController.js';

const router = Router();
router.post('/', createEmergencyRequest);

export default router;
