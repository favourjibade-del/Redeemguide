# RedeemGuide - AI-Powered Smart Navigation & Assistance Platform

## Project Overview

RedeemGuide is a comprehensive SaaS (Software-as-a-Service) platform designed to help visitors, worshippers, volunteers, and residents navigate Redemption City of God with ease. The platform provides real-time navigation, crowd intelligence, emergency support, and event management capabilities.

### Key Features

- **Smart Digital Mapping**: Interactive maps with real-time location services
- **AI-Assisted Navigation**: Intelligent routing with multiple transport options
- **Real-time Location Services**: GPS-based location tracking and navigation
- **Crowd Intelligence**: Real-time crowd density and movement analytics
- **Emergency Support Tools**: Emergency reporting and response coordination
- **Event Information Systems**: Event discovery, registration, and notifications
- **Multi-user Support**: Support for visitors, volunteers, staff, and emergency personnel

## Technology Stack

### Backend
- **Framework**: Django 6.0.6 with Django REST Framework
- **Database**: PostgreSQL (with SQLite fallback for development)
- **Task Queue**: Celery with Redis
- **API Documentation**: drf-spectacular (Swagger/ReDoc)
- **Authentication**: JWT with djangorestframework-simplejwt
- **Deployment**: Gunicorn + NGINX

### Frontend
- **Framework**: React 18+ with Vite
- **UI Components**: Material-UI or Tailwind CSS
- **State Management**: Redux Toolkit or Zustand
- **Maps**: Google Maps API / Leaflet
- **Real-time**: WebSockets with Socket.io
- **Build Tool**: Vite

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Cloud Deployment**: AWS/Azure/GCP ready
- **CI/CD**: GitHub Actions / GitLab CI
- **Monitoring**: Sentry, NewRelic (optional)

## Project Structure

```
RedeemGuide/
├── backend/
│   ├── redeemguide_api/          # Main Django project settings
│   │   ├── settings.py           # Django settings
│   │   ├── urls.py               # URL routing
│   │   ├── wsgi.py               # WSGI application
│   │   └── celery.py             # Celery configuration
│   ├── users/                    # User management app
│   ├── locations/                # Locations and places app
│   ├── navigation/               # Navigation and routing app
│   ├── events/                   # Events management app
│   ├── crowd_intelligence/       # Crowd analytics app
│   ├── emergency_services/       # Emergency services app
│   ├── manage.py                 # Django management script
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Environment variables template
│   └── venv/                     # Python virtual environment
│
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API services
│   │   ├── store/                # State management
│   │   ├── styles/               # Global styles
│   │   ├── utils/                # Utility functions
│   │   ├── App.tsx              # Main App component
│   │   └── main.tsx             # Entry point
│   ├── public/                   # Static assets
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.ts            # Vite configuration
│   ├── tsconfig.json             # TypeScript configuration
│   └── tailwind.config.js        # Tailwind CSS configuration
│
├── .gitignore
├── .env.example
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 16+ and npm/yarn
- PostgreSQL 12+ (for production)
- Redis 6+ (for caching and task queue)
- Git

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Virtual environment is already created** at `venv/`
   
3. **Install dependencies**:
   ```bash
   cmd /c venv\Scripts\activate.bat
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   copy .env.example .env
   # Edit .env with your settings
   ```

5. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

6. **Create superuser**:
   ```bash
   python manage.py createsuperuser
   ```

7. **Collect static files**:
   ```bash
   python manage.py collectstatic --no-input
   ```

8. **Run development server**:
   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install Node.js from https://nodejs.org/**

2. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create environment file**:
   ```bash
   copy .env.example .env.local
   # Edit with your API URL
   ```

5. **Run development server**:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## Backend Models Overview

### Users App
- `CustomUser`: Extended user model with profile information
- `UserPreferences`: User settings and notification preferences
- `UserActivity`: Track user interactions for analytics

### Locations App
- `Location`: Physical locations within Redemption City
- `LocationCategory`: Categories for organizing locations
- `LocationReview`: User reviews and ratings
- `LocationHours`: Operating hours for locations

### Navigation App
- `Route`: Pre-defined routes between locations
- `Navigation`: Active navigation sessions
- `NavigationCheckpoint`: Waypoints during navigation
- `Landmark`: Points of interest along routes

### Events App
- `Event`: Events at Redemption City
- `EventAttendee`: Event registrations and check-ins
- `EventNotification`: Event-related notifications

### Crowd Intelligence App
- `CrowdDensity`: Real-time crowd density metrics
- `CrowdFlow`: Crowd movement patterns
- `CrowdAlert`: Alerts about crowd situations
- `PredictedCongestion`: AI predictions for future congestion
- `CrowdBehaviorMetric`: Historical analytics data

### Emergency Services App
- `EmergencyService`: Emergency service providers
- `EmergencyReport`: Incident reports
- `EmergencyResponse`: Service responses to incidents
- `SafetyTip`: Safety guidelines and tips
- `IncidentHistory`: Historical incident data

## API Endpoints

### Authentication
- `POST /api/token/`: Obtain JWT token
- `POST /api/token/refresh/`: Refresh JWT token

### Users
- `GET/POST /api/v1/users/`: List/create users
- `GET/PUT/PATCH/DELETE /api/v1/users/{id}/`: User details
- `GET/PUT /api/v1/user-preferences/`: User preferences

### Locations
- `GET/POST /api/v1/locations/`: List/create locations
- `GET/PUT /api/v1/locations/{id}/`: Location details
- `GET/POST /api/v1/location-reviews/`: Location reviews

### Navigation
- `GET/POST /api/v1/routes/`: List/create routes
- `GET/POST /api/v1/navigation/`: Start navigation session

### Events
- `GET/POST /api/v1/events/`: List/create events
- `GET/POST /api/v1/event-attendees/`: Event registrations

### Crowd Intelligence
- `GET /api/v1/crowd-density/`: Real-time crowd density
- `GET /api/v1/crowd-alerts/`: Active crowd alerts
- `GET /api/v1/crowd-flow/`: Crowd movement data

### Emergency Services
- `GET /api/v1/emergency-services/`: List emergency services
- `POST /api/v1/emergency-reports/`: Report emergency

### Documentation
- Swagger UI: `/api/docs/`
- ReDoc: `/api/redoc/`

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_ENGINE=django.db.backends.postgresql
DATABASE_NAME=redeemguide
DATABASE_USER=postgres
DATABASE_PASSWORD=your-password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# JWT
JWT_SECRET_KEY=your-jwt-secret

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Redis & Celery
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0

# Google Maps
GOOGLE_MAPS_API_KEY=your-api-key
```

## Database Setup

### PostgreSQL (Production)

1. **Install PostgreSQL**
2. **Create database and user**:
   ```sql
   CREATE DATABASE redeemguide;
   CREATE USER redeemguide_user WITH PASSWORD 'your_password';
   ALTER ROLE redeemguide_user SET client_encoding TO 'utf8';
   ALTER ROLE redeemguide_user SET default_transaction_isolation TO 'read committed';
   ALTER ROLE redeemguide_user SET default_transaction_deferrable TO on;
   GRANT ALL PRIVILEGES ON DATABASE redeemguide TO redeemguide_user;
   ```

3. **Update `.env` file** with database credentials

4. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

## Development Commands

### Backend

```bash
# Activate virtual environment (Windows)
.\venv\Scripts\activate.bat

# Run development server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --no-input

# Run tests
python manage.py test

# Start Celery worker
celery -A redeemguide_api worker -l info

# Start Celery beat scheduler
celery -A redeemguide_api beat -l info
```

### Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint and format
npm run lint
npm run format
```

## Deployment

### Docker Deployment

1. **Build Docker image**:
   ```bash
   docker build -t redeemguide-api .
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

### Production Checklist

- [ ] Set `DEBUG=False` in `.env`
- [ ] Update `SECRET_KEY` with a strong random value
- [ ] Configure allowed hosts
- [ ] Set up HTTPS/SSL
- [ ] Configure email service
- [ ] Set up database backups
- [ ] Enable logging and monitoring
- [ ] Configure CDN for static files
- [ ] Set up rate limiting
- [ ] Configure CORS properly

## Troubleshooting

### Common Issues

1. **Virtual environment not activating**:
   ```bash
   py -m venv venv
   ```

2. **Database connection error**:
   - Check PostgreSQL is running
   - Verify DATABASE credentials in `.env`
   - Run migrations: `python manage.py migrate`

3. **Port already in use**:
   ```bash
   # Backend: specify different port
   python manage.py runserver 8001
   
   # Frontend: Vite uses different port automatically
   ```

4. **CORS errors**:
   - Ensure frontend URL is in `CORS_ALLOWED_ORIGINS` in `.env`
   - Check that backend is serving from correct domain

## API Testing

Use Postman, Insomnia, or curl to test API endpoints:

```bash
# Get JWT token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Use token in requests
curl -X GET http://localhost:8000/api/v1/locations/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## License

This project is proprietary and confidential.

## Support

For support, email: support@redeemguide.com

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
#   R e d e e m g u i d e  
 