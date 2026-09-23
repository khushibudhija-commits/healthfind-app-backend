import Hospital from '../models/Hospital.js';
import seedHospitals from '../data/hospitals.json' with { type: 'json' };

let useDatabase = false;
export function setAnalyticsDatabaseReady(ready) { useDatabase = ready; }

async function getHospitals() {
    return useDatabase ? Hospital.find({}, { treatments: 1 }).lean() : seedHospitals;
}

export async function getTreatmentAnalytics(disease = '') {
    const hospitals = await getHospitals();
    const treatments = hospitals.flatMap((hospital) => hospital.treatments || []).filter((treatment) => !disease || treatment.name.toLowerCase().includes(disease.toLowerCase()) || treatment.category?.toLowerCase().includes(disease.toLowerCase()));
    const validTreatments = treatments.filter((treatment) => treatment.estimatedCost?.min != null && treatment.estimatedCost?.max != null && treatment.outcomeRate != null);
    const totalPatientsTreated = validTreatments.reduce((total, treatment) => total + (treatment.patientsTreated || 100), 0);
    const averageCost = validTreatments.length ? Math.round(validTreatments.reduce((total, treatment) => total + (treatment.estimatedCost.min + treatment.estimatedCost.max) / 2, 0) / validTreatments.length) : 0;
    const successRate = validTreatments.length ? Number((validTreatments.reduce((total, treatment) => total + treatment.outcomeRate, 0) / validTreatments.length).toFixed(1)) : 0;

    return { disease: disease || 'All treatments', totalPatientsTreated, averageCost, successRate, treatmentCount: validTreatments.length, patientsTreatedIsEstimate: !validTreatments.some((treatment) => treatment.patientsTreated != null) };
}