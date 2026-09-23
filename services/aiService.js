import seedHospitals from '../data/hospitals.json' with { type: 'json' };

const treatmentsList = [...new Set(seedHospitals.flatMap((hospital) => hospital.treatments || []).map((item) => item.name))];
const facilitiesList = [...new Set(seedHospitals.flatMap((hospital) => hospital.facilities || []))];
const locationsList = [...new Set(seedHospitals.flatMap((hospital) => [hospital.city, hospital.district, hospital.state]).filter(Boolean))];

const treatmentAliases = {
    knee: 'Knee Replacement',
    cataract: 'Cataract Surgery',
    eye: 'Cataract Surgery',
    heart: 'Heart Surgery',
    cardiac: 'Heart Surgery',
    bypass: 'Heart Bypass Surgery',
    angioplasty: 'Angioplasty',
    fracture: 'Fracture Treatment',
    bone: 'Fracture Treatment',
    gallbladder: 'Gallbladder Surgery',
    appendix: 'Appendix Surgery',
    hernia: 'Hernia Repair',
    chest: 'Chest Treatment',
    lung: 'Chest Treatment',
    asthma: 'Asthma Treatment',
    pneumonia: 'Pneumonia Treatment',
    dialysis: 'Dialysis',
    kidney: 'Kidney Stone Treatment',
    stroke: 'Stroke Rehabilitation',
    spine: 'Spine Surgery',
    cancer: 'Cancer Chemotherapy',
    radiation: 'Radiation Therapy',
    diabetes: 'Diabetes Management',
    delivery: 'Normal Delivery',
    pregnancy: 'Normal Delivery',
    dental: 'Root Canal Treatment',
    skin: 'Skin Allergy Treatment',
    ent: 'Ear Infection Treatment'
};

const facilityAliases = {
    mri: 'MRI',
    icu: 'ICU',
    emergency: 'Emergency',
    'ct scan': 'CT Scan',
    ct: 'CT Scan',
    'blood bank': 'Blood Bank',
    blood: 'Blood Bank',
    pharmacy: 'Pharmacy',
    ambulance: 'Ambulance',
    dialysis: 'Dialysis',
    endoscopy: 'Endoscopy',
    radiotherapy: 'Radiotherapy'
};

export function interpretQuery(query = '') {
    const text = (query || '').toLowerCase();

    // 1. Treatment
    let treatment = treatmentsList.find((item) => text.includes(item.toLowerCase()));
    if (!treatment) {
        for (const [keyword, mappedName] of Object.entries(treatmentAliases)) {
            if (new RegExp(`\\b${keyword}\\b`, 'i').test(text)) {
                treatment = mappedName;
                break;
            }
        }
    }

    // 2. Hospital Type
    let type = undefined;
    if (/\bgovernment\b|\bgovt\b|\bcivil\b/i.test(text)) {
        type = 'Government';
    } else if (/\bprivate\b/i.test(text)) {
        type = 'Private';
    } else if (/\bcharitable\b|\btrust\b/i.test(text)) {
        type = 'Trust/Charitable';
    }

    // 3. Facilities
    const foundFacilities = new Set();
    for (const facility of facilitiesList) {
        if (text.includes(facility.toLowerCase())) {
            foundFacilities.add(facility);
        }
    }
    for (const [keyword, mappedFacility] of Object.entries(facilityAliases)) {
        if (new RegExp(`\\b${keyword}\\b`, 'i').test(text)) {
            foundFacilities.add(mappedFacility);
        }
    }

    // 4. Budget
    let budget = undefined;
    const budgetMatch = text.match(/(?:under|below|less than|within|budget of|upto|up to)\s*(?:inr|rs\.?|₹)?\s*([\d,]+)\s*(k|lac|lakh)?/i);
    if (budgetMatch) {
        const rawNum = Number(budgetMatch[1].replaceAll(',', ''));
        if (!Number.isNaN(rawNum)) {
            budget = rawNum;
            const unit = (budgetMatch[2] || '').toLowerCase();
            if (unit === 'k' || (budget < 1000 && text.includes('k'))) {
                budget *= 1000;
            } else if (unit === 'lac' || unit === 'lakh') {
                budget *= 100000;
            }
        }
    }

    // 5. Location
    let location = locationsList.find((item) => text.includes(item.toLowerCase()));

    const result = {
        location: location || undefined,
        treatment: treatment || undefined,
        budget: budget || undefined,
        type: type || undefined,
        hospitalType: type || undefined,
        facilities: Array.from(foundFacilities)
    };

    return result;
}

export function getChatReply(filters, resultCount) {
    if (!filters.treatment && !filters.location && !filters.budget && !filters.type && !filters.facilities?.length) {
        return { reply: 'Tell me the treatment or condition you need help with, and your city if you know it.', needsDetails: true };
    }
    if (!filters.treatment) {
        return { reply: 'Which treatment or condition should I search for?', needsDetails: true };
    }
    if (!resultCount) {
        return { reply: 'I could not find an exact match with all those filters. Try a wider location, a higher budget, or removing a facility filter.', needsDetails: false };
    }
    return { reply: `I found ${resultCount} hospital${resultCount === 1 ? '' : 's'} matching your requirements.`, needsDetails: false };
}
