import { Router } from 'express';
import { aiSearch, chat, searchHospitals } from '../controllers/searchController.js';
const router = Router();
router.post('/', searchHospitals);
router.post('/ai', aiSearch);
router.post('/chat', chat);
export default router;
