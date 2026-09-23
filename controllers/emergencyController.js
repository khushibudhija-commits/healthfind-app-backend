import EmergencyRequest from '../models/EmergencyRequest.js';

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

    try {
        const request = await EmergencyRequest.create({
            contactNumber: normalizedNumber,
            location: { latitude: numericLatitude, longitude: numericLongitude }
        });
        res.status(201).json({
            success: true,
            message: 'Emergency contact received',
            data: {
                id: request._id,
                contactNumber: request.contactNumber,
                location: request.location,
                createdAt: request.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Unable to save emergency contact' });
    }
}
