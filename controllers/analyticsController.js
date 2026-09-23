import { getTreatmentAnalytics } from '../services/analyticsService.js';

export async function treatmentAnalytics(req, res) {
    try {
        res.json({ success: true, data: await getTreatmentAnalytics(req.query.disease || '') });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}