# RedeemGuide SaaS - Complete Setup Guide

## Project Overview

This document provides step-by-step instructions to set up and run the RedeemGuide SaaS application with Django backend and React frontend.

**Current Status**: Backend structure fully created with virtual environment and dependencies installed. Frontend ready for setup.

## What Has Been Completed

### ✅ Backend Setup
- [x] Created Python virtual environment (`venv/`)
- [x] Installed all dependencies (Django, DRF, Celery, Redis, PostgreSQL client, etc.)
- [x] Created Django project (`redeemguide_api`)
- [x] Created 6 Django apps with comprehensive models:
  - `users` - User management and authentication
  - `locations` - Location management
  - `navigation` - Route and navigation management
  - `events` - Event management
  - `crowd_intelligence` - Crowd analytics
  - `emergency_services` - Emergency management
- [x] Configured Django settings with DRF, JWT, CORS, Celery
- [x] Created comprehensive data models for all features
- [x] Generated `requirements.txt` with all dependencies
- [x] Created `.env.example` template
- [x] Created API serializers for users

### ✅ Frontend Foundation
- [x] Created `package.json` with all necessary dependencies
- [x] Created `vite.config.ts` configuration
- [x] Created `tsconfig.json` for TypeScript
- [x] Created `.env.example` template

### ✅ Infrastructure
- [x] Created `docker-compose.yml` with full stack
- [x] Created backend `Dockerfile`
- [x] Created comprehensive `README.md`
- [x] Created `.gitignore`

## Next Steps

### Phase 1: Backend Configuration & Database (Estimated: 30 mins)

1. **Update Django Settings**:
   - [ ] Update the `AUTH_USER_MODEL` to use CustomUser in settings.py:
     ```python
     AUTH_USER_MODEL = 'users.CustomUser'
     ```

2. **Create Django Admin Interface**:
   - [ ] Create `admin.py` for each app with model registrations
   - [ ] Configure admin filters and search fields

3. **Create Django Views & ViewSets**:
   - [ ] Create views and viewsets for all apps
   - [ ] Implement serializers for remaining models
   - [ ] Set up permissions and authentication

4. **Database Setup**:
   - [ ] Install PostgreSQL locally (or use SQLite for dev)
   - [ ] Update `.env` file with database credentials
   - [ ] Run migrations:
     ```bash
     cd backend
     cmd /c venv\Scripts\activate.bat
     python manage.py migrate
     python manage.py createsuperuser
     ```

5. **Test Backend**:
   - [ ] Run development server
   - [ ] Access admin interface at http://localhost:8000/admin
   - [ ] Test API endpoints at http://localhost:8000/api/docs/

### Phase 2: Frontend Setup (Estimated: 30 mins)

1. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org/ (LTS version recommended)
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Create Frontend Environment File**:
   ```bash
   cd frontend
   copy .env.example .env.local
   ```

4. **Create Frontend Structure**:
   - [ ] Create `src/` directory structure:
     ```
     src/
     ├── components/
     │   ├── Navigation/
     │   ├── Map/
     │   ├── Events/
     │   ├── Emergency/
     │   └── Common/
     ├── pages/
     │   ├── Home.tsx
     │   ├── Map.tsx
     │   ├── Events.tsx
     │   ├── Dashboard.tsx
     │   └── Admin.tsx
     ├── services/
     │   ├── api.ts
     │   ├── auth.ts
     │   ├── locations.ts
     │   ├── events.ts
     │   └── crowd.ts
     ├── store/
     │   ├── authStore.ts
     │   ├── locationStore.ts
     │   ├── uiStore.ts
     │   └── types.ts
     ├── styles/
     │   ├── globals.css
     │   └── tailwind.css
     ├── utils/
     │   ├── constants.ts
     │   └── helpers.ts
     ├── App.tsx
     └── main.tsx
     ```

5. **Create React Components**:
   - [ ] Layout components (Header, Sidebar, Footer)
   - [ ] Map component with Leaflet/Google Maps
   - [ ] Event list and details
   - [ ] User profile
   - [ ] Emergency reporting
   - [ ] Crowd density display

6. **Set Up State Management**:
   - [ ] Create Zustand stores for auth, UI, data
   - [ ] Implement local storage persistence

7. **Create API Service Layer**:
   - [ ] Create Axios instance with base configuration
   - [ ] Implement API service functions
   - [ ] Add request/response interceptors

### Phase 3: Feature Implementation (Estimated: 2-3 hours)

1. **Authentication & Authorization**:
   - [ ] Implement JWT token refresh logic
   - [ ] Create login/register pages
   - [ ] Add Protected routes
   - [ ] Implement user profile management

2. **Navigation Feature**:
   - [ ] Integrate Google Maps/Leaflet
   - [ ] Implement route search functionality
   - [ ] Show real-time navigation
   - [ ] Display landmarks and directions

3. **Event Management**:
   - [ ] Display event listings
   - [ ] Create event detail pages
   - [ ] Implement event registration
   - [ ] Show event calendar

4. **Crowd Intelligence**:
   - [ ] Display crowd density heatmaps
   - [ ] Show crowd alerts
   - [ ] Implement real-time updates with WebSockets

5. **Emergency Services**:
   - [ ] Create emergency report form
   - [ ] Show emergency services locations
   - [ ] Implement emergency alert notifications

### Phase 4: Testing & Deployment (Estimated: 1 hour)

1. **Backend Testing**:
   - [ ] Create unit tests
   - [ ] Create integration tests
   - [ ] Run test suite: `python manage.py test`

2. **Frontend Testing**:
   - [ ] Create component tests with Vitest
   - [ ] Run tests: `npm test`

3. **Docker Deployment**:
   - [ ] Build and test Docker containers
   - [ ] Run with Docker Compose
   - [ ] Configure NGINX proxy

4. **Production Deployment**:
   - [ ] Set up CI/CD pipeline
   - [ ] Deploy to cloud platform (AWS/Azure/GCP)
   - [ ] Configure domain and SSL

## Quick Start Commands

### Backend

```bash
# Navigate to backend
cd backend

# Activate virtual environment
cmd /c venv\Scripts\activate.bat

# Run development server
python manage.py runserver

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Open admin interface
# Visit http://localhost:8000/admin
```

### Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not done)
npm install

# Run development server
npm run dev

# Visit http://localhost:5173
```

## Important Configuration Files

### Backend
- **`settings.py`** - Main Django configuration ✅ CONFIGURED
- **`urls.py`** - API routes ✅ CONFIGURED
- **`requirements.txt`** - Python dependencies ✅ CREATED
- **`.env`** - Environment variables (create from `.env.example`)
- **Models** - All database models ✅ CREATED
- **Serializers** - API serializers (In progress)
- **Views** - API viewsets (TODO)

### Frontend
- **`vite.config.ts`** - Build configuration ✅ CREATED
- **`tsconfig.json`** - TypeScript configuration ✅ CREATED
- **`package.json`** - Dependencies ✅ CREATED
- **`.env.local`** - Frontend environment (create from `.env.example`)

## Database Models Overview

### Users App (Created)
- `CustomUser` - Extended user model
- `UserPreferences` - User settings
- `UserActivity` - Activity tracking

### Locations App (Created)
- `Location` - Physical locations
- `LocationCategory` - Location types
- `LocationReview` - User reviews
- `LocationHours` - Operating hours

### Navigation App (Created)
- `Route` - Pre-defined routes
- `Navigation` - Active navigation sessions
- `NavigationCheckpoint` - Waypoints
- `Landmark` - Points of interest

### Events App (Created)
- `Event` - Event listings
- `EventAttendee` - Registrations
- `EventNotification` - Notifications

### Crowd Intelligence App (Created)
- `CrowdDensity` - Real-time crowd data
- `CrowdFlow` - Movement patterns
- `CrowdAlert` - Crowd alerts
- `PredictedCongestion` - AI predictions
- `CrowdBehaviorMetric` - Analytics

### Emergency Services App (Created)
- `EmergencyService` - Service providers
- `EmergencyReport` - Incident reports
- `EmergencyResponse` - Service responses
- `SafetyTip` - Safety information
- `IncidentHistory` - Historical data

## Directory Structure

```
RedeemGuide/
├── backend/
│   ├── redeemguide_api/        ✅ Created
│   ├── users/                  ✅ Created with models
│   ├── locations/              ✅ Created with models
│   ├── navigation/             ✅ Created with models
│   ├── events/                 ✅ Created with models
│   ├── crowd_intelligence/     ✅ Created with models
│   ├── emergency_services/     ✅ Created with models
│   ├── requirements.txt        ✅ Created
│   ├── .env.example            ✅ Created
│   ├── Dockerfile              ✅ Created
│   └── venv/                   ✅ Created
├── frontend/
│   ├── src/                    📝 TODO
│   ├── public/                 📝 TODO
│   ├── package.json            ✅ Created
│   ├── vite.config.ts          ✅ Created
│   ├── tsconfig.json           ✅ Created
│   ├── .env.example            ✅ Created
│   └── node_modules/           (after npm install)
├── docker-compose.yml          ✅ Created
├── .gitignore                  ✅ Created
├── README.md                   ✅ Created
└── SETUP.md                    ✅ Created
```

## Troubleshooting

### Virtual Environment Issues
```bash
# Create new virtual environment if needed
python -m venv venv

# Activate it
cd backend
.\venv\Scripts\activate.bat

# Reinstall dependencies
pip install -r requirements.txt
```

### Database Issues
```bash
# Drop and recreate database (SQLite)
del db.sqlite3
python manage.py migrate

# For PostgreSQL, recreate the database using psql
```

### Port Already in Use
```bash
# Backend - use different port
python manage.py runserver 8001

# Frontend - Vite automatically uses next available port
```

## Next Immediate Steps

1. **Set up the .env file**:
   ```bash
   cd backend
   copy .env.example .env
   # Edit .env with your settings
   ```

2. **Update Django settings.py**:
   - Add `AUTH_USER_MODEL = 'users.CustomUser'` to settings

3. **Run migrations**:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

4. **Create remaining serializers and views** for all models

5. **Set up Node.js and install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

6. **Start development servers**:
   - Backend: `python manage.py runserver`
   - Frontend: `npm run dev`

## Support & Documentation

- Django: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- React: https://react.dev/
- Vite: https://vitejs.dev/
- PostgreSQL: https://www.postgresql.org/docs/

## Project Status Summary

- **Backend**: 70% complete (models, settings, basic serializers done)
- **Frontend**: 5% complete (configs only)
- **Infrastructure**: 80% complete (Docker setup done)
- **Overall Progress**: ~50%

---

**Last Updated**: 2026-06-09
**Created for**: RedeemGuide SaaS Platform
