import mongoose from 'mongoose';

const treatmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: String,
    estimatedCost: { min: Number, max: Number },
    outcomeRate: Number,
    patientsTreated: Number
}, { _id: false });

const doctorAvailabilitySchema = new mongoose.Schema({
    day: { type: String, required: true },
    departments: [String],
    timing: String
}, { _id: false });

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['Government', 'Private', 'Trust/Charitable'] },
    address: String,
    city: String,
    district: String,
    state: String,
    phone: String,
    receptionPhone: String,
    image: String,
    rating: Number,
    doctorAvailability: [doctorAvailabilitySchema],
    website: String,
    location: { type: { type: String, enum: ['Point'] }, coordinates: [Number] },
    facilities: [String],
    treatments: [treatmentSchema]
}, { collection: 'hospitals', timestamps: true });

hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ city: 1 });
hospitalSchema.index({ district: 1 });
hospitalSchema.index({ type: 1 });
hospitalSchema.index({ 'treatments.name': 1 });
hospitalSchema.index({ facilities: 1 });
export default mongoose.model('Hospital', hospitalSchema);
