# CampusFlow - Complete Setup Guide

## Quick Summary

This project has 3 main components:
1. **Backend** (Node.js/Express) - Port 3000
2. **Frontend** (Angular) - Port 4200
3. **AI Service** (Python/Flask) - Port 5000 (Optional)

## Prerequisites

- Node.js 16+ and npm
- MySQL 8.0+
- Python 3.8+ (for AI service only)
- Angular CLI 14+

## Step-by-Step Setup

### 1. Database Setup

```sql
-- Open MySQL and create database
CREATE DATABASE campusflow;
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
# Edit backend/.env with your database credentials

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start backend server
npm run dev
```

Backend should now be running on `http://localhost:3000`

### 3. Frontend Setup

```bash
# Navigate to frontend (open new terminal)
cd frontend

# Install dependencies
npm install

# Start frontend server
ng serve
```

Frontend should now be running on `http://localhost:4200`

### 4. AI Service Setup (Optional)

**Windows - Easy Way:**
Double-click `start-ai-service.bat` in project root

**Manual Way:**
```bash
# Navigate to AI service (open new terminal)
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start AI service
python app.py
```

AI Service should now be running on `http://localhost:5000`

## Verification

### Check All Services

1. **Backend:** http://localhost:3000/api/auth/login (should return 400 - missing credentials)
2. **Frontend:** http://localhost:4200 (should show login page)
3. **AI Service:** http://localhost:5000/health (should return {"status": "ok"})

### Test Login

**Super User (All Roles):**
- Email: `superuser@university.edu`
- Password: `password123`
- Roles: Admin, Student, Faculty, Seating Manager, Club Coordinator

**Other Test Accounts:**
- Admin: `admin@university.edu` / `password123`
- Student: `student1@university.edu` / `password123`
- Faculty: `faculty1@university.edu` / `password123`
- Seating Manager: `seating@university.edu` / `password123`

## Features to Test

### 1. Role Switching (Super User)
1. Login as `superuser@university.edu`
2. Click role switcher in header (top-right)
3. Switch between all 5 roles
4. Each role shows different dashboard and features

### 2. Bulk Hall Ticket Upload (Admin)
1. Login as admin or super user
2. Go to: Admin Dashboard → Bulk Upload Hall Tickets
3. Create test PDF files named:
   - `CS2021001.pdf`
   - `CS2021002.pdf`
4. Select "Mid-Semester Examination - March 2024"
5. Upload files
6. Should see success messages

### 3. Student Features
1. Login as `student1@university.edu`
2. Test:
   - View enrolled courses
   - View course materials
   - Submit assignments
   - View hall tickets
   - Download hall tickets
   - View notifications

### 4. Faculty Features
1. Login as `faculty1@university.edu`
2. Test:
   - View assigned courses
   - Upload course materials
   - Create assignments
   - Grade submissions
   - View student list

### 5. Seating Manager Features
1. Login as `seating@university.edu`
2. Test:
   - Create new exam
   - Add subjects to exam
   - Publish exam
   - Allocate seats
   - View seating chart
   - Generate hall tickets

### 6. Mind Map (AI Service Required)
1. Login as student
2. Go to: Student Dashboard → Mind Map
3. Upload a PDF syllabus
4. Generate mind map
5. View topics and subtopics

## Common Issues

### Backend Won't Start
- Check MySQL is running
- Verify database credentials in `backend/.env`
- Run `npm run db:reset` to reset database

### Frontend Won't Start
- Run `npm install` in frontend folder
- Check port 4200 is not in use
- Clear Angular cache: `ng cache clean`

### AI Service Won't Start
- See `AI_SERVICE_TROUBLESHOOTING.md`
- Quick fix: Double-click `start-ai-service.bat`

### "Student not found" in Bulk Upload
- Database was reset with correct roll numbers
- Use roll numbers: CS2021001, CS2021002, ECE2021001, etc.
- See `BULK_HALL_TICKET_TEST_GUIDE.md` for complete list

### "Insufficient Permissions" Error
- Fixed! Middleware now checks all user roles
- Logout and login again if issue persists

## Project Structure

```
CampusFlow/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation
│   │   └── database/       # Migrations, seeds
│   ├── uploads/            # Uploaded files
│   └── .env               # Configuration
│
├── frontend/               # Angular SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Shared components
│   │   │   ├── modules/    # Feature modules
│   │   │   ├── services/   # API services
│   │   │   └── guards/     # Route guards
│   │   └── environments/   # Environment config
│   └── angular.json
│
├── ai-service/             # Python/Flask AI
│   ├── services/           # PDF processing, mind maps
│   ├── uploads/            # Temporary uploads
│   ├── app.py             # Main application
│   └── requirements.txt    # Python dependencies
│
└── Documentation/
    ├── README.md
    ├── COMPLETE_SETUP_GUIDE.md (this file)
    ├── MULTI_ROLE_USER_GUIDE.md
    ├── BULK_HALL_TICKET_TEST_GUIDE.md
    ├── AI_SERVICE_TROUBLESHOOTING.md
    └── PROJECT_PRESENTATION_SCRIPT.md
```

## Available Roll Numbers for Testing

### Computer Science
- CS2021000 (Super User)
- CS2021001 (John Doe)
- CS2021002 (Jane Smith)
- CS2021003 (Bob Johnson)
- CS2021004 (Alice Williams)

### Electronics
- ECE2021001 (Charlie Brown)
- ECE2021002 (Diana Davis)
- ECE2021003 (Eve Miller)

### Mechanical
- MECH2021001 (Frank Wilson)
- MECH2021002 (Grace Moore)

### Civil
- CIVIL2021001 (Henry Taylor)
- CIVIL2021002 (Ivy Anderson)

### Electrical
- EEE2021001 (Jack Thomas)

## Development Workflow

### Making Changes

1. **Backend Changes:**
   - Edit files in `backend/src/`
   - Server auto-restarts (nodemon)
   - Check terminal for errors

2. **Frontend Changes:**
   - Edit files in `frontend/src/`
   - Browser auto-reloads
   - Check browser console for errors

3. **Database Changes:**
   - Create migration: `cd backend && npx knex migrate:make migration_name`
   - Run migration: `npm run migrate`
   - Update seed if needed: Edit `backend/src/database/seeds/03_comprehensive_seed.js`
   - Reset database: `npm run db:reset`

### Adding New Features

1. **Backend:**
   - Add route in `backend/src/routes/`
   - Add controller in `backend/src/controllers/`
   - Add service logic in `backend/src/services/`
   - Add middleware if needed

2. **Frontend:**
   - Generate component: `ng generate component modules/[module]/[component]`
   - Add route in module routing
   - Add service method in `frontend/src/app/services/`
   - Update UI components

## Deployment

### Backend Deployment
```bash
# Set environment to production
NODE_ENV=production

# Run migrations
npm run migrate

# Start with PM2
pm2 start src/server.js --name campusflow-backend
```

### Frontend Deployment
```bash
# Build for production
ng build --configuration production

# Deploy dist/ folder to web server
```

### AI Service Deployment
```bash
# Install Gunicorn
pip install gunicorn

# Start with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Support

For issues or questions:
1. Check documentation files in project root
2. Check browser console (F12) for frontend errors
3. Check terminal output for backend/AI service errors
4. Review `AI_SERVICE_TROUBLESHOOTING.md` for AI service issues
5. Review `BULK_HALL_TICKET_TEST_GUIDE.md` for upload issues

## Next Steps

1. ✅ Setup complete - all services running
2. ✅ Test login with super user
3. ✅ Test role switching
4. ✅ Test bulk hall ticket upload
5. ✅ Test student features
6. ✅ Test faculty features
7. ✅ Test seating manager features
8. ✅ Test AI mind map generation (if AI service running)
9. 📝 Customize for your institution
10. 🚀 Deploy to production

## Congratulations!

Your CampusFlow Academic Exam Management System is now ready to use! 🎉
