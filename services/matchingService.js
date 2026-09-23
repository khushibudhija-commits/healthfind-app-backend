import Hospital from '../models/Hospital.js';
import seedHospitals from '../data/hospitals.json' with { type: 'json' };

let useDatabase = false;
export function setDatabaseReady(ready) { useDatabase = ready; }

export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
    if ([lat1, lon1, lat2, lon2].some((v) => v == null || Number.isNaN(Number(v)))) return null;
    const R = 6371; // Earth radius in km
    const toRad = (angle) => (angle * Math.PI) / 180;
    const dLat = toRad(Number(lat2) - Number(lat1));
    const dLon = toRad(Number(lon2) - Number(lon1));
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(Number(lat1))) * Math.cos(toRad(Number(lat2))) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}

const hospitalImages = {
    "Civil Hospital Hoshiarpur":
        "https://res.cloudinary.com/dtjobqhxb/image/upload/v1764841564/stordial/vacp8lzkfizuy8d9qyc9.webp",
    "DMC Heart Institute":
        "https://www.dmchinternationalpatients.com/uploads/gallery/3HDHI_Unit.jpg",
    "Amandeep Hospital Amritsar":
        "https://www.joonsquare.com/usermanage/image/business/amandeep-hospital-amritsar-3234/amandeep-hospital-amritsar-amandeep-hospital-g-t-rd-amritsar-gpo-amritsar-hospitals-2mjwdk9.jpg",
    "Fortis Hospital Mohali":
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80",
    "Rajindra Hospital Patiala":
        "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rajindra%20Hospital%20Patiala.jpg",
    "Max Super Speciality Hospital Bathinda":
        "https://travocure.com/wp-content/uploads/2021/12/22-2.jpg",
    "SGL Charitable Hospital":
        "https://www.sglhealthcare.org/assets/mustafabad/2.jpg",
    "Ivy Hospital Nawanshahr":
        "https://static.tuffclassified.com/22673/2330770.jpg",
    "Patel Hospital Jalandhar":
        "https://images1-fabric.practo.com/practices/697656/patel-hospital-jalandhar-664871e28f5df.png",
    "Mohandai Oswal Hospital":
        "https://moh.org.in/images/storyimg.png",
    "Civil Hospital Gurdaspur":
        "https://www.tribuneindia.com/sortd-service/imaginary/v22-01/jpg/large/high?url=dGhldHJpYnVuZS1zb3J0ZC1wcm8tcHJvZC1zb3J0ZC9tZWRpYTJlZGIxM2UwLTRlNTktMTFlZi05ZmFhLWFiNzg5M2FlZWVhYy5qcGc%3D",
    "SPS Hospital Ludhiana":
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80"
};

const imageAliases = {
    'Fortis Mohali': 'Fortis Hospital Mohali',
    'SGL Charitable Hospital Jalandhar': 'SGL Charitable Hospital',
    'Max Super Speciality Hospital Bathinda': 'Max Super Speciality Hospital Bathinda',
    'Ivy Hospital Khanna': 'Ivy Hospital Nawanshahr',
    'Mohandai Oswal Cancer Hospital': 'Mohandai Oswal Hospital',
    'SPS Hospitals Ludhiana': 'SPS Hospital Ludhiana'
};

const directFallbackImage = 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80';

export function withHospitalImage(hospital) {
    const outcomes = hospital.treatments?.map((treatment) => treatment.outcomeRate).filter((rate) => Number.isFinite(rate)) || [];
    const calculatedRating = outcomes.length ? Number((outcomes.reduce((total, rate) => total + rate, 0) / outcomes.length / 20).toFixed(1)) : 4.2;
    const mappedImage = hospitalImages[hospital.name] || hospitalImages[imageAliases[hospital.name]];
    return {
        ...hospital,
        image: hospital.image || mappedImage || directFallbackImage,
        rating: hospital.rating ?? calculatedRating
    };
}

export function generateMatchReasons(hospital, filters = {}, distanceKm = null) {
    const reasons = [];
    const targetType = filters.hospitalType || filters.type;
    if (targetType && hospital.type && hospital.type.toLowerCase() === targetType.toLowerCase()) {
        reasons.push(`${hospital.type} healthcare provider`);
    }
    if (filters.treatment) {
        const tr = hospital.treatments?.find((t) => t.name.toLowerCase().includes(filters.treatment.toLowerCase()) || t.category?.toLowerCase().includes(filters.treatment.toLowerCase()));
        if (tr) {
            reasons.push(`${tr.name} available (${tr.outcomeRate}% outcome rate)`);
        }
    }
    const reqFacs = Array.isArray(filters.facilities) ? filters.facilities : filters.facilities ? [filters.facilities] : [];
    for (const fac of reqFacs) {
        if (hospital.facilities?.some((f) => f.toLowerCase() === fac.toLowerCase())) {
            reasons.push(`${fac} facility available`);
        }
    }
    if (filters.budget) {
        const budget = Number(filters.budget);
        const cost = hospital.treatmentMetrics?.averageCost;
        if (cost && cost <= budget) {
            reasons.push(`Estimated cost (₹${cost.toLocaleString()}) within ₹${budget.toLocaleString()}`);
        }
    }
    if (filters.location) {
        const text = `${hospital.city} ${hospital.district} ${hospital.state}`.toLowerCase();
        if (text.includes(filters.location.toLowerCase())) {
            reasons.push(`Located in ${hospital.city}, ${hospital.district}`);
        }
    }
    if (distanceKm != null && Number.isFinite(distanceKm)) {
        reasons.push(`${distanceKm} km away from your location`);
    }

    if (reasons.length === 0) {
        if (hospital.facilities?.includes('Emergency')) reasons.push('24/7 Emergency unit available');
        if (hospital.facilities?.includes('ICU')) reasons.push('ICU facility available');
        if (hospital.selectedTreatment) reasons.push(`${hospital.selectedTreatment.name} offered`);
    }

    return reasons;
}

function matchesBudget(hospital, filters) {
    const min = filters.minBudget != null ? Number(filters.minBudget) : undefined;
    const max = filters.maxBudget != null ? Number(filters.maxBudget) : (filters.budget != null ? Number(filters.budget) : undefined);
    
    if (min == null && max == null) return true;

    const relevantTreatments = filters.treatment
        ? hospital.treatments?.filter((item) => item.name.toLowerCase().includes(filters.treatment.toLowerCase()))
        : hospital.treatments;

    if (!relevantTreatments?.length) return true;

    return relevantTreatments.some((item) => {
        if (!item.estimatedCost) return false;
        const avg = (item.estimatedCost.min + item.estimatedCost.max) / 2;
        if (min != null && avg < min) return false;
        if (max != null && avg > max) return false;
        return true;
    });
}

function matches(hospital, filters = {}) {
    const requestedFacilities = Array.isArray(filters.facilities) ? filters.facilities : (filters.facilities ? [filters.facilities] : []);
    const text = `${hospital.name} ${hospital.city} ${hospital.district} ${hospital.state} ${hospital.address}`.toLowerCase();

    if (filters.location && !text.includes(filters.location.toLowerCase())) return false;
    
    const targetType = filters.hospitalType || filters.type;
    if (targetType && hospital.type?.toLowerCase() !== targetType.toLowerCase()) return false;

    if (requestedFacilities.length && !requestedFacilities.every((fac) => hospital.facilities?.some((f) => f.toLowerCase() === fac.toLowerCase()))) {
        return false;
    }

    if (filters.treatment) {
        const found = hospital.treatments?.some((item) => item.name.toLowerCase().includes(filters.treatment.toLowerCase()) || item.category?.toLowerCase().includes(filters.treatment.toLowerCase()));
        if (!found) return false;
    }

    if (!matchesBudget(hospital, filters)) return false;

    if (filters.search) {
        const s = filters.search.toLowerCase();
        const matchesNameOrPlace = text.includes(s);
        const matchesTreatment = hospital.treatments?.some((item) => item.name.toLowerCase().includes(s) || item.category?.toLowerCase().includes(s));
        if (!matchesNameOrPlace && !matchesTreatment) return false;
    }

    return true;
}

function withSelectedTreatment(hospital, treatmentName = '', originLat = null, originLng = null) {
    const selectedTreatment = hospital.treatments?.find((item) => !treatmentName || item.name.toLowerCase().includes(treatmentName.toLowerCase()) || item.category?.toLowerCase().includes(treatmentName.toLowerCase())) || hospital.treatments?.[0];
    
    const treatmentRating = selectedTreatment?.outcomeRate == null ? undefined : Number((selectedTreatment.outcomeRate / 20).toFixed(1));

    const distanceKm = (originLat != null && originLng != null && hospital.location?.coordinates)
        ? haversineDistanceKm(originLat, originLng, hospital.location.coordinates[1], hospital.location.coordinates[0])
        : (hospital.distanceKm ?? null);

    return withHospitalImage({
        ...hospital,
        rating: treatmentRating ?? hospital.rating,
        selectedTreatment,
        distanceKm,
        treatmentMetrics: selectedTreatment ? {
            totalPatientsTreated: selectedTreatment.patientsTreated || 120,
            averageCost: Math.round(((selectedTreatment.estimatedCost?.min ?? 0) + (selectedTreatment.estimatedCost?.max ?? 0)) / 2),
            successRate: selectedTreatment.outcomeRate || 92,
            patientsTreatedIsEstimate: selectedTreatment.patientsTreated == null
        } : undefined
    });
}

function sortHospitals(hospitals, sortBy = 'success') {
    return [...hospitals].sort((first, second) => {
        if (sortBy === 'distance') {
            const d1 = first.distanceKm != null ? first.distanceKm : Infinity;
            const d2 = second.distanceKm != null ? second.distanceKm : Infinity;
            return d1 - d2;
        }
        if (sortBy === 'cost' || sortBy === 'cost_asc') {
            const c1 = first.treatmentMetrics?.averageCost ?? Infinity;
            const c2 = second.treatmentMetrics?.averageCost ?? Infinity;
            return c1 - c2;
        }
        if (sortBy === 'cost_desc') {
            const c1 = first.treatmentMetrics?.averageCost ?? -Infinity;
            const c2 = second.treatmentMetrics?.averageCost ?? -Infinity;
            return c2 - c1;
        }
        if (sortBy === 'name') {
            return (first.name || '').localeCompare(second.name || '');
        }
        // Default: success rate
        const s1 = first.treatmentMetrics?.successRate ?? -Infinity;
        const s2 = second.treatmentMetrics?.successRate ?? -Infinity;
        return s2 - s1;
    });
}

export async function findHospitals(filters = {}) {
    const originLat = filters.originLatitude != null ? Number(filters.originLatitude) : (filters.latitude != null ? Number(filters.latitude) : null);
    const originLng = filters.originLongitude != null ? Number(filters.originLongitude) : (filters.longitude != null ? Number(filters.longitude) : null);

    let list = [];
    if (!useDatabase) {
        list = seedHospitals
            .filter((h) => matches(h, filters))
            .map((h) => withSelectedTreatment(h, filters.treatment, originLat, originLng));
    } else {
        const query = {};
        if (filters.location) {
            query.$or = [
                { city: new RegExp(filters.location, 'i') },
                { district: new RegExp(filters.location, 'i') },
                { state: new RegExp(filters.location, 'i') }
            ];
        }
        const targetType = filters.hospitalType || filters.type;
        if (targetType) query.type = targetType;
        
        const reqFacilities = Array.isArray(filters.facilities) ? filters.facilities : (filters.facilities ? [filters.facilities] : []);
        if (reqFacilities.length) {
            query.facilities = { $all: reqFacilities.map((f) => new RegExp(`^${f}$`, 'i')) };
        }
        if (filters.treatment) {
            query['treatments.name'] = new RegExp(filters.treatment, 'i');
        }
        if (filters.search) {
            query.$or = [
                { name: new RegExp(filters.search, 'i') },
                { city: new RegExp(filters.search, 'i') },
                { district: new RegExp(filters.search, 'i') },
                { 'treatments.name': new RegExp(filters.search, 'i') }
            ];
        }
        const dbResults = await Hospital.find(query).lean();
        const budgetFiltered = dbResults.filter((h) => matchesBudget(h, filters));
        list = budgetFiltered.map((h) => withSelectedTreatment(h, filters.treatment, originLat, originLng));
    }

    // Filter distance radius if specified (e.g. withinKm = 10)
    if (filters.withinKm && originLat != null && originLng != null) {
        const maxKm = Number(filters.withinKm);
        list = list.filter((h) => h.distanceKm != null && h.distanceKm <= maxKm);
    }

    // Attach explainable match reasons to every hospital
    list = list.map((h) => ({
        ...h,
        matchReasons: generateMatchReasons(h, filters, h.distanceKm)
    }));

    return sortHospitals(list, filters.sort || (filters.originLatitude ? 'distance' : 'success'));
}

export async function findTreatmentNames() {
    if (!useDatabase) {
        return [...new Set(seedHospitals.flatMap((hospital) => hospital.treatments || []).map((t) => t.name))].sort();
    }
    return (await Hospital.distinct('treatments.name')).sort();
}

export async function findFacilities(filters = {}) {
    const hospitals = useDatabase
        ? await Hospital.find(filters.treatment ? { 'treatments.name': new RegExp(filters.treatment, 'i') } : {}, { facilities: 1 }).lean()
        : seedHospitals.filter((h) => !filters.treatment || h.treatments?.some((t) => t.name.toLowerCase().includes(filters.treatment.toLowerCase())));
    return [...new Set(hospitals.flatMap((h) => h.facilities || []))].sort();
}

export async function findHospitalById(id) {
    if (!id) return null;
    let hospital = null;
    if (!useDatabase) {
        hospital = seedHospitals.find((item) => item._id === id || item.name.toLowerCase().replaceAll(' ', '-') === id.toLowerCase() || item.name.toLowerCase() === id.toLowerCase());
    } else {
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            hospital = await Hospital.findById(id).lean();
        } else {
            hospital = await Hospital.findOne({ name: new RegExp(`^${id.replaceAll('-', ' ')}$`, 'i') }).lean();
        }
    }
    return hospital ? withHospitalImage(hospital) : null;
}

export async function findNearby(longitude, latitude, maxDistance = 150000) {
    const originLng = Number(longitude);
    const originLat = Number(latitude);
    if (!Number.isFinite(originLng) || !Number.isFinite(originLat)) return [];

    let results = [];
    if (!useDatabase) {
        results = seedHospitals.map((hospital) => {
            const hLng = hospital.location?.coordinates?.[0];
            const hLat = hospital.location?.coordinates?.[1];
            const distanceKm = haversineDistanceKm(originLat, originLng, hLat, hLng);
            return withHospitalImage({
                ...hospital,
                distanceKm
            });
        });
    } else {
        try {
            const dbNearby = await Hospital.find({
                location: {
                    $near: {
                        $geometry: { type: 'Point', coordinates: [originLng, originLat] },
                        $maxDistance: maxDistance
                    }
                }
            }).limit(25).lean();

            results = dbNearby.map((hospital) => {
                const hLng = hospital.location?.coordinates?.[0];
                const hLat = hospital.location?.coordinates?.[1];
                const distanceKm = haversineDistanceKm(originLat, originLng, hLat, hLng);
                return withHospitalImage({
                    ...hospital,
                    distanceKm
                });
            });
        } catch (err) {
            // If 2dsphere index not yet built or failed, fallback to memory
            results = seedHospitals.map((hospital) => {
                const hLng = hospital.location?.coordinates?.[0];
                const hLat = hospital.location?.coordinates?.[1];
                const distanceKm = haversineDistanceKm(originLat, originLng, hLat, hLng);
                return withHospitalImage({
                    ...hospital,
                    distanceKm
                });
            });
        }
    }

    // Sort strictly by geographical distance
    return results.sort((a, b) => {
        const da = a.distanceKm != null ? a.distanceKm : Infinity;
        const db = b.distanceKm != null ? b.distanceKm : Infinity;
        return da - db;
    });
}
