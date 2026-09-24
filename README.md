# HealthFind Frontend

React + Vite frontend for the HealthFind healthcare discovery application. This app lets users search hospitals, compare facilities, browse treatments, and submit emergency requests through a clean patient-focused interface.

## Overview

The frontend is responsible for:

- hospital search and filtering
- treatment and facility browsing
- detailed hospital profiles
- side-by-side comparison of hospitals
- emergency assistance flow
- AI-powered care assistant/chat interaction
- map-based and distance-aware hospital suggestions

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Lucide React icons

## Project Structure

```bash
healthfind-app-frontend/
├── src/
│   ├── components/
│   │   ├── AnalyticsStats.jsx
│   │   ├── Chatbot.jsx
│   │   ├── DataCompleteness.jsx
│   │   ├── EmergencyButton.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── Footer.jsx
│   │   ├── HospitalCard.jsx
│   │   ├── HospitalDetailsPage.jsx
│   │   ├── Loading.jsx
│   │   ├── MatchReasons.jsx
│   │   ├── Navbar.jsx
│   │   ├── SearchBar.jsx
│   │   └── TreatmentsPage.jsx
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── CompareHospitals.jsx
│   │   ├── Emergency.jsx
│   │   ├── Home.jsx
│   │   ├── Hospitals.jsx
│   │   ├── HospitalDetails.jsx
│   │   ├── NotFound.jsx
│   │   ├── SearchResults.jsx
│   │   └── Treatments.jsx
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── distance.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── README.md
└── public/
```

## Installation

1. Open the frontend folder:

```bash
cd healthfind-app-frontend
```

2. Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the frontend root if needed:

```env
VITE_API_URL=http://localhost:5000/api
```

This value is used by the API client in `src/services/api.js` to connect to the backend.

## Run the App

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Application Routes

The app uses React Router and includes these routes:

- `/` - Home page
- `/hospitals` - hospital listings
- `/search` - filtered/hospital search results
- `/hospitals/:id` - hospital detail view
- `/compare` - compare shortlisted hospitals
- `/treatments` - treatment-based navigation
- `/emergency` - emergency assistance page
- `/about` - about section
- `*` - not found route

## API Integration

The frontend talks to the backend using the helper in:

```bash
src/services/api.js
```

It supports calls for:

- hospital list and details
- filters and search
- analytics data
- AI chat search
- emergency request submission
- driving distance lookup

## Key UI Features

- hospital comparison shortlist with max 3 entries
- user location support for nearby recommendations
- chatbot assistant drawer
- emergency floating action button
- responsive layout with Tailwind styling

## Development Notes

- The app expects the backend to be running before most features work correctly.
- `VITE_API_URL` should point to the backend API base URL.
- Local storage is used for the comparison shortlist, so the user can keep selected hospitals across page navigation.

## Deployment

This frontend is designed to be built as a static Vite application and deployed to any frontend host such as Vercel, Netlify, or static hosting platforms.

---

The frontend is the patient-facing layer of HealthFind and connects all healthcare discovery features to the backend API.
