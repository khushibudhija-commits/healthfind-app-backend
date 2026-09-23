import mongoose from 'mongoose';
import EmergencyRequest from '../models/EmergencyRequest.js';

// In-memory fallback storage when database is disconnected or cold
const inMemoryEmergencyRequests = [];

export async function createEmergencyRequest(req, res) {
    const { contactNumber, phone, phoneNumber, latitude, longitude } = req.body;
    const submittedContactNumber = contactNumber || phone || phoneNumber;
    const normalizedNumber = String(submittedContactNumber || '').trim();
    const numericLatitude = Number(latitude);
    const numericLongitude = Number(longitude);

    if (!/^[+\d][\d\s().-]{6,19}$/.test(normalizedNumber)) {
        return res.status(400).json({ success: false, message: 'A valid contact number is required' });
    }

    if (!Number.isFinite(numericLatitude) || numericLatitude < -90 || numericLatitude > 90 ||
        !Number.isFinite(numericLongitude) || numericLongitude < -180 || numericLongitude > 180) {
        return res.status(400).json({ success: false, message: 'Valid live location coordinates are required' });
    }

    // If MongoDB is actively connected, persist to MongoDB collection
    if (mongoose.connection?.readyState === 1) {
        try {
            const request = await EmergencyRequest.create({
                contactNumber: normalizedNumber,
                location: { latitude: numericLatitude, longitude: numericLongitude }
            });
            return res.status(201).json({
                success: true,
                message: 'Emergency contact received',
                data: {
                    id: request._id,
                    contactNumber: request.contactNumber,
                    location: request.location,
                    createdAt: request.createdAt
                }
            });
        } catch (dbError) {
            if (dbError.code === 11000) {
                const existing = await EmergencyRequest.findOne({
                    contactNumber: normalizedNumber,
                    'location.latitude': numericLatitude,
                    'location.longitude': numericLongitude
                }).lean();
                return res.status(200).json({
                    success: true,
                    message: 'Emergency contact already received',
                    data: {
                        id: existing?._id,
                        contactNumber: existing?.contactNumber || normalizedNumber,
                        location: existing?.location || { latitude: numericLatitude, longitude: numericLongitude },
                        createdAt: existing?.createdAt || new Date()
                    }
                });
            }
            console.warn('MongoDB emergency insert failed, falling back to memory:', dbError.message);
        }
    }

    // Graceful fallback for offline DB / cloud cold start
    const fallbackItem = {
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        contactNumber: normalizedNumber,
        location: { latitude: numericLatitude, longitude: numericLongitude },
        createdAt: new Date()
    };
    inMemoryEmergencyRequests.push(fallbackItem);

    return res.status(201).json({
        success: true,
        message: 'Emergency contact received',
        data: fallbackItem
    });
}
