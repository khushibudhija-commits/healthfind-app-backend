import 'dotenv/config';
import dns from 'node:dns';
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


try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
    console.warn('DNS server configuration warning:', dnsErr.message);
}

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'HealthFind API is running successfully',
        status: 'operational',
        endpoints: {
            health: '/api/health',
            hospitals: '/api/hospitals',
            treatments: '/api/treatments',
            facilities: '/api/facilities',
            search: '/api/search',
            aiSearch: '/api/search/ai',
            chat: '/api/search/chat',
            analytics: '/api/analytics/treatments',
            emergency: '/api/emergency-requests'
        }
    });
});

// Health & Diagnostics
app.get('/api/health', (_req, res) => res.json({ success: true, service: 'HealthFind API', status: 'operational' }));
app.get('/health', (_req, res) => res.json({ success: true, service: 'HealthFind API', status: 'operational' }));

// Core API endpoints (supports both /api/ prefix and direct root prefix for client compatibility)
app.use('/api/hospitals', hospitalRoutes);
app.use('/hospitals', hospitalRoutes);

app.use('/api/search', searchRoutes);
app.use('/search', searchRoutes);

app.use('/api/analytics', analyticsRoutes);
app.use('/analytics', analyticsRoutes);

app.use('/api/emergency-requests', emergencyRoutes);
app.use('/emergency-requests', emergencyRoutes);

// Direct access to treatments & facilities
app.get('/api/treatments', listTreatments);
app.get('/treatments', listTreatments);

app.get('/api/facilities', listFacilities);
app.get('/facilities', listFacilities);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

const port = process.env.PORT || 5000;

// Listen immediately so hosting platforms (e.g. Render) detect port readiness without waiting for DB
app.listen(port, "0.0.0.0", () => {
    console.log(`HealthFind API running on port ${port}`);
});

// Asynchronously connect to MongoDB without blocking server availability
connectDatabase()
    .then((databaseReady) => {
        setDatabaseReady(databaseReady);
        setAnalyticsDatabaseReady(databaseReady);
    })
    .catch((err) => {
        console.warn(`Database connection error: ${err.message}`);
    });