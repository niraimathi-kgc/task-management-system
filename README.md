# Task Management System

A modern full-stack task management application built with Django, Next.js, Kafka, and PostgreSQL.

## Features

- User Authentication and Authorization
- Task Creation and Management
- Team Collaboration
- Real-time Updates and Notifications
- Task Assignment and Status Tracking
- Modern Responsive UI

## Tech Stack

- **Backend**: Django REST Framework
- **Frontend**: Next.js 14
- **Database**: PostgreSQL
- **Message Broker**: Apache Kafka
- **Real-time Updates**: Kafka + WebSockets
- **Cache**: Redis

## Project Structure

```
task-management-system/
├── backend/               # Django backend
│   ├── api/              # REST API endpoints
│   ├── core/             # Core application logic
│   └── config/           # Django settings
├── frontend/             # Next.js frontend
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   └── lib/             # Utility functions
└── scripts/             # Utility scripts
```

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Python 3.9+
- Node.js 18+

### Quick Start with Docker

1. Start the infrastructure services:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Kafka and Zookeeper
- Redis cache

2. Initialize Kafka topics:
```bash
chmod +x scripts/init-kafka.sh
./scripts/init-kafka.sh
```

### Backend Setup

1. Create and activate virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Start the development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

The application should now be accessible at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- API Documentation: http://localhost:8000/api/docs/

### Stopping the Services

To stop all Docker services:
```bash
docker-compose down
```

To stop and remove all data (including database):
```bash
docker-compose down -v
```

## API Documentation

The API documentation is available at `/api/docs/` when running the backend server. 