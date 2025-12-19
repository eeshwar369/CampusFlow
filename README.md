# Academic Exam Management System

Integrated Academic and Examination Management System with AI-powered features.

## Features

- Role-based authentication (Student, Administrator, Seating Manager, Club Coordinator)
- AI-powered syllabus mind map generation
- Automated seating allocation with configurable algorithms
- Hall ticket generation with QR codes
- Event proposal and approval workflow
- Academic calendar management
- Study recommendations based on performance data

## Technology Stack

- **Frontend**: Angular 17+ with Angular Material
- **Backend**: Node.js/Express with JWT authentication
- **Database**: MySQL 8.0+
- **AI Service**: Python Flask/FastAPI with spaCy NLP

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.10+
- MySQL 8.0+
- npm or yarn

### Installation

1. Clone the repository
2. Install all dependencies:
   ```bash
   npm run install:all
   ```

3. Set up environment variables (see .env.example files in each directory)

4. Set up the database:
   ```bash
   cd backend
   npm run migrate
   ```

5. Start the services:
   ```bash
   # Terminal 1 - Backend
   npm run backend:dev

   # Terminal 2 - Frontend
   npm run frontend

   # Terminal 3 - AI Service
   npm run ai-service
   ```

## Project Structure

```
├── backend/          # Node.js/Express API
├── frontend/         # Angular application
├── ai-service/       # Python AI/ML service
└── database/         # Database migrations and seeds
```

## License

MIT
