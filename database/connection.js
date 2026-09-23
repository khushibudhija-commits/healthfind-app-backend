import mongoose from 'mongoose';

export async function connectDatabase() {
    if (!process.env.MONGODB_URI) return false;
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
        return true;
    } catch (error) {
        console.warn(`MongoDB unavailable: ${error.message}`);
        return false;
    }
}
