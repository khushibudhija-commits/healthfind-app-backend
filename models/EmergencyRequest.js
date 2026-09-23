import mongoose from 'mongoose';

const emergencyRequestSchema = new mongoose.Schema({
    contactNumber: { type: String, required: true, trim: true },
    location: {
        latitude: { type: Number, required: true, min: -90, max: 90 },
        longitude: { type: Number, required: true, min: -180, max: 180 }
    },
    status: { type: String, enum: ['received'], default: 'received' }
}, { collection: 'emergency_requests', timestamps: true });

emergencyRequestSchema.index({ 'location.latitude': 1,
     'location.longitude': 1,
    contactNumber: 1 }, { unique: true, partialFilterExpression: { contactNumber: { $exists: true } } });

export default mongoose.model('EmergencyRequest', emergencyRequestSchema);
