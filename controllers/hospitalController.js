import { findFacilities, findHospitalById, findHospitals, findNearby, findTreatmentNames, haversineDistanceKm } from '../services/matchingService.js';

export async function listHospitals(req, res) {
    try {
        const hospitals = await findHospitals(req.query);
        res.json({ success: true, count: hospitals.length, data: hospitals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Unable to retrieve hospitals' });
    }
}

export async function getHospital(req, res) {
    try {
        const hospital = await findHospitalById(req.params.id);
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });
        
        // If query parameters include patient coordinates, attach distance
        const { latitude, longitude } = req.query;
        let enhanced = hospital;
        if (latitude && longitude && hospital.location?.coordinates) {
            const distanceKm = haversineDistanceKm(latitude, longitude, hospital.location.coordinates[1], hospital.location.coordinates[0]);
            enhanced = { ...hospital, distanceKm };
        }
        res.json({ success: true, data: enhanced });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function nearbyHospitals(req, res) {
    try {
        const { longitude, latitude, maxDistance } = req.query;
        if (!longitude || !latitude) {
            return res.status(400).json({ success: false, message: 'longitude and latitude are required' });
        }
        const hospitals = await findNearby(Number(longitude), Number(latitude), maxDistance ? Number(maxDistance) : undefined);
        res.json({ success: true, count: hospitals.length, data: hospitals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Error finding nearby hospitals' });
    }
}

export async function listTreatments(_req, res) {
    try {
        const treatments = await findTreatmentNames();
        res.json({ success: true, count: treatments.length, data: treatments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Unable to retrieve treatments' });
    }
}

export async function listFacilities(req, res) {
    try {
        const facilities = await findFacilities(req.query);
        res.json({ success: true, count: facilities.length, data: facilities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Unable to retrieve facilities' });
    }
}

export async function getDrivingDistance(req, res) {
    const { originLatitude, originLongitude, destinationLatitude, destinationLongitude } = req.query;
    if ([originLatitude, originLongitude, destinationLatitude, destinationLongitude].some((value) => value == null || Number.isNaN(Number(value)))) {
        return res.status(400).json({ success: false, message: 'Origin and destination coordinates are required' });
    }
    
    // First calculate exact Haversine straight line as fast baseline
    const haversineKm = haversineDistanceKm(originLatitude, originLongitude, destinationLatitude, destinationLongitude);

    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${originLongitude},${originLatitude};${destinationLongitude},${destinationLatitude}?overview=false`;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(routeUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const payload = await response.json();
        const route = payload.routes?.[0];
        if (!response.ok || payload.code !== 'Ok' || !route) throw new Error(payload.message || 'Road distance request failed');
        
        res.json({
            success: true,
            data: {
                distanceMeters: route.distance,
                distanceText: `${(route.distance / 1000).toFixed(1)} km`,
                durationText: `${Math.round(route.duration / 60)} min`
            }
        });
    } catch {
        // Graceful fallback to Haversine straight-line distance if external OSRM is slow or offline
        const estMeters = haversineKm ? Math.round(haversineKm * 1000 * 1.25) : 5000;
        const estDurationMin = Math.round((estMeters / 1000) / 40 * 60);
        res.json({
            success: true,
            data: {
                distanceMeters: estMeters,
                distanceText: `${haversineKm != null ? haversineKm.toFixed(1) : '~5'} km`,
                durationText: `${estDurationMin} min`,
                isEstimated: true
            }
        });
    }
}
