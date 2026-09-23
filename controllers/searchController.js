import { findHospitals } from '../services/matchingService.js';
import { getChatReply, interpretQuery } from '../services/aiService.js';

export async function searchHospitals(req, res) {
    try {
        const filters = { ...req.query, ...req.body };
        const hospitals = await findHospitals(filters);
        res.json({ success: true, count: hospitals.length, data: hospitals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Search failed' });
    }
}

export async function aiSearch(req, res) {
    try {
        const query = (req.body?.query || req.query?.query || '').trim();
        // If client provided manual filter overrides (e.g. after user removes/changes tags)
        const clientFilters = req.body?.filters || {};
        
        let filters = {};
        if (query) {
            filters = interpretQuery(query);
        }
        // Merge with any manual client filter overrides
        const effectiveFilters = { ...filters, ...clientFilters };

        // Support geolocation coordinates passed alongside
        if (req.body?.originLatitude && req.body?.originLongitude) {
            effectiveFilters.originLatitude = req.body.originLatitude;
            effectiveFilters.originLongitude = req.body.originLongitude;
        }

        const hospitals = await findHospitals(effectiveFilters);
        res.json({
            success: true,
            query,
            filters: effectiveFilters,
            count: hospitals.length,
            data: hospitals
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'AI search failed' });
    }
}

export async function chat(req, res) {
    try {
        const message = (req.body?.message || req.query?.message || '').trim();
        if (!message) return res.status(400).json({ success: false, message: 'message is required' });
        const filters = interpretQuery(message);
        const hospitals = await findHospitals(filters);
        const { reply, needsDetails } = getChatReply(filters, hospitals.length);
        res.json({ success: true, reply, needsDetails, filters, count: hospitals.length, data: hospitals.slice(0, 8) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Chat assistant error' });
    }
}
