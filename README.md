# HealthFind Backend

Express + MongoDB API for the HealthFind healthcare discovery platform. This service powers hospital listings, smart search, treatment analytics, and emergency request handling.

## Overview

The backend exposes REST APIs for:

- hospital catalog and filtering
- nearby hospital discovery
- treatment and facility lookup
- AI-assisted hospital search
- analytics for treatment availability
- emergency request intake

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- dotenv for environment configuration
- CORS enabled for frontend access

## Project Structure

```bash
healthfind-app-backend/
├── controllers/
│   ├── analyticsController.js
│   ├── emergencyController.js
│   ├── hospitalController.js
│   └── searchController.js
├── data/
│   └── hospitals.json
├── database/
│   └── connection.js
├── models/
│   ├── EmergencyRequest.js
│   └── Hospital.js
├── routes/
│   ├── analyticsRoutes.js
│   ├── emergencyRoutes.js
│   ├── hospitalRoutes.js
│   └── searchRoutes.js
├── scripts/
│   └── seedHospitals.js
├── services/
│   ├── aiService.js
│   ├── analyticsService.js
│   └── matchingService.js
├── .env.example
├── package.json
├── server.js
└── README.md
```

## Installation

1. Open the backend folder:

```bash
cd healthfind-app-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env
```

4. Update the environment variables:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/healthfind
AI_API_KEY=
```

## Run the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The API runs by default on:

```bash
http://localhost:5000
```

## Seed Data

To load hospital seed data:

```bash
npm run seed
```

## API Endpoints

### Health

- `GET /` - API status and available endpoints
- `GET /api/health`
- `GET /health`

### Hospitals

- `GET /api/hospitals`
- `GET /api/hospitals/:id`
- `GET /api/hospitals/nearby`
- `GET /api/hospitals/distance`
- `GET /api/treatments`
- `GET /api/facilities`

### Search

- `POST /api/search`
- `POST /api/search/ai`
- `POST /api/search/chat`

### Analytics

- `GET /api/analytics/treatments`

### Emergency

- `POST /api/emergency-requests`
- `GET /api/emergency-requests` (if used by the service layer)

## Important Notes

- The server supports both `/api/...` and root-prefixed routes for frontend compatibility.
- Database connectivity is attempted asynchronously, so the server stays available even if MongoDB is temporarily down.
- The app uses `connectDatabase()` in `database/connection.js` and disables blocking startup if MongoDB is unavailable.

## Typical Workflow

1. Start the API server.
2. Seed hospital data.
3. Frontend requests data from the backend via the configured API URL.
4. Search, analytics, and emergency endpoints respond with relevant medical discovery data.

## Deployment

The app is designed to work with hosting platforms like Render or similar services where the server can start without a fully ready MongoDB instance.

---

This backend is meant to support the HealthFind frontend app and handle all core healthcare discovery logic and data access.
