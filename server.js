import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './database/connection.js';
import { setDatabaseReady } from './services/matchingService.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import { listFacilities, listTreatments } from './controllers/hospitalController.js';
import { setAnalyticsDatabaseReady } from './services/analyticsService.js';

const app = express();
app.use(cors());
app.use(express.json());
// Root route
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'HealthFind API is running successfully',
        status: 'operational'
    });
});
// Health & Diagnostics
app.get('/api/health', (_req, res) => res.json({ success: true, service: 'HealthFind API', status: 'operational' }));

// Core API endpoints
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/emergency-requests', emergencyRoutes);

// Direct top-level access to treatments & facilities
app.get('/api/treatments', listTreatments);
app.get('/api/facilities', listFacilities);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

const port = process.env.PORT || 5000;
const databaseReady = await connectDatabase();
setDatabaseReady(databaseReady);
setAnalyticsDatabaseReady(databaseReady);
app.listen(port, "0.0.0.0", () => {
    console.log(`HealthFind API running on port ${port}`);
});