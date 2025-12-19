# CampusFlow - Academic Exam Management System

Complete integrated Academic and Examination Management System with AI-powered features, role-based access control, and comprehensive administrative tools.

---

## 🎯 Features

### Core Features
- **Role-Based Authentication** - JWT-based auth with 5 roles (Admin, Student, Faculty, Club Coordinator, Seating Manager)
- **Multi-Role Support** - Users can have multiple roles and switch between them
- **Dark Theme** - Toggle between light and dark themes with persistence
- **Toast Notifications** - Modern notification system throughout the app

### Admin Features
- Student Management (CRUD operations)
- Course Management
- Fee Payment Approval/Rejection
- Hall Ticket Approval
- Notification Publishing (with priority levels)
- Report Generation (performance, attendance, fees, enrollment)
- **Bulk Student Upload/Download** - Excel import/export for student data
- Seating Allocation Management

### Student Features
- Personal Dashboard
- **AI-Powered Mind Map Generator** - Upload syllabus PDF, get interactive mind maps
- Hall Ticket Download
- Course Enrollment View
- Fee Payment Status
- Notifications

### Faculty Features
- Faculty Dashboard
- Course Management
- Student Performance Tracking

### Club Coordinator Features
- Club Dashboard
- Event Management (Create, Update, Cancel)
- Member Management
- Event Participant Tracking

### Seating Manager Features
- Automated Seating Allocation
- Room Management
- Exam Scheduling

---

## 🛠️ Technology Stack

### Frontend
- **Angular 15+** - Modern web framework
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming
- **Angular Material** - UI components
- **SCSS** - Styling

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **MySQL 8.0+** - Relational database
- **Knex.js** - SQL query builder & migrations
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **ExcelJS** - Excel file generation/parsing
- **Multer** - File upload handling

### AI Service
- **Python 3.10+** - Programming language
- **Flask** - Web framework
- **PyPDF2** - PDF processing
- **spaCy** - NLP processing

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://www.python.org/))
- **MySQL** 8.0+ ([Download](https://dev.mysql.com/downloads/))
- **npm** or **yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd Zeninth
```

### 2. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE campusflow;
exit;
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env file with your database credentials

# Run migrations
npm run migrate

# Seed database with demo data
npm run seed

# Start backend server
npm start
```
Backend runs on: **http://localhost:3000**

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```
Frontend runs on: **http://localhost:4200**

### 5. AI Service Setup
```bash
cd ai-service

# Install dependencies
pip install -r requirements.txt

# Start AI service
python app.py
```
AI Service runs on: **http://localhost:5000**

---

## 🔐 Test Credentials

All passwords: **password123**

### Admin
- **Email**: admin@university.edu
- **Access**: Full admin dashboard, all management features

### Students
- **Emails**: student1@university.edu to student12@university.edu
- **Access**: Student dashboard, mind map, hall tickets

### Faculty
- **Emails**: faculty1@university.edu to faculty4@university.edu
- **Access**: Faculty dashboard, course management

### Club Coordinator
- **Email**: club@university.edu
- **Access**: Club dashboard, event management

### Multi-Role User
- **Email**: faculty4@university.edu
- **Roles**: faculty + club_coordinator
- **Access**: Can switch between roles

---

## 📁 Project Structure

```
Zeninth/
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── controllers/        # API controllers
│   │   ├── services/           # Business logic
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Auth, error handling
│   │   ├── config/             # Configuration
│   │   └── database/
│   │       ├── migrations/     # Database schema (18 files)
│   │       └── seeds/          # Demo data
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── knexfile.js             # Database config
│
├── frontend/                   # Angular Frontend
│   ├── src/
│   │   └── app/
│   │       ├── components/     # Shared components
│   │       ├── modules/        # Feature modules
│   │       │   ├── admin/      # Admin features
│   │       │   ├── student/    # Student features
│   │       │   ├── faculty/    # Faculty features
│   │       │   └── club/       # Club features
│   │       ├── services/       # API services
│   │       ├── guards/         # Route guards
│   │       ├── interceptors/   # HTTP interceptors
│   │       └── models/         # TypeScript models
│   ├── package.json
│   └── angular.json
│
└── ai-service/                 # Python AI Service
    ├── services/               # AI modules
    ├── app.py                  # Flask app
    └── requirements.txt
```

---

## 🗄️ Database

### Tables (38 total)
- **users** - User accounts with roles
- **students** - Student details
- **faculty** - Faculty details
- **courses** - Course information
- **course_enrollments** - Student-course mapping
- **exams** - Exam schedules
- **hall_tickets** - Hall ticket records
- **rooms** - Room information
- **seating_allocations** - Exam seating
- **fee_payments** - Payment records
- **notifications** - System notifications
- **student_academic_status** - Academic progress
- **clubs** - Club information
- **club_members** - Club membership
- **events** - Event records
- And more...

### Seed Data Included
- 19 users (various roles)
- 12 students across 5 departments
- 4 faculty members
- 15 courses
- 10 rooms
- 8 exams
- 3 clubs
- 4 events
- Complete relational data

---

## 🔧 Useful Commands

### Backend
```bash
cd backend

# Start server
npm start

# Development mode (auto-reload)
npm run dev

# Run migrations
npm run migrate

# Rollback migration
npm run migrate:rollback

# Seed database
npm run seed

# Reset database (rollback + migrate + seed)
npm run db:reset

# Run tests
npm test
```

### Frontend
```bash
cd frontend

# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

### AI Service
```bash
cd ai-service

# Start service
python app.py

# Install dependencies
pip install -r requirements.txt
```

---

## 🎨 Key Features Explained

### 1. Bulk Student Upload/Download
**Location**: Admin Dashboard → Bulk Upload

**Features**:
- Download Excel file with all current students
- Modify student data in Excel
- Upload modified file to:
  - Create new students
  - Update existing students
  - Deactivate students (set Active = "No")
- Detailed error reporting for failed rows

**Excel Format**:
| ID | Email | First Name | Last Name | Roll Number | Department | Year | Semester | Active |
|----|-------|------------|-----------|-------------|------------|------|----------|--------|

### 2. AI Mind Map Generator
**Location**: Student Dashboard → Mind Map Helper

**Features**:
- Upload syllabus PDF
- AI extracts topics and creates hierarchical mind map
- Interactive visualization
- Study recommendations

### 3. Multi-Role System
**Location**: Header (after login)

**Features**:
- Users can have multiple roles
- Dropdown to switch between roles
- Dashboard changes based on active role
- Seamless role switching without re-login

### 4. Dark Theme
**Location**: Header → Moon/Sun icon

**Features**:
- Toggle between light and dark themes
- Persists across sessions (localStorage)
- Applies to all components

### 5. Club Event Management
**Location**: Club Dashboard → Manage Events

**Features**:
- Create events with details
- Update event information
- Cancel events with reason
- View registered participants
- Event change history/audit log
- Automatic participant notifications

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt with salt rounds
- **Role-Based Access Control** - Route guards on frontend and backend
- **HTTP Interceptors** - Automatic token injection
- **Auth Guards** - Prevent unauthorized access
- **Input Validation** - Server-side validation
- **SQL Injection Prevention** - Parameterized queries

---

## 🧪 Testing

### Test Scenarios

#### 1. Login & Authentication
```
1. Open http://localhost:4200
2. Login with any test credential
3. Verify dashboard loads
4. Test logout
5. Verify cannot navigate back after logout
```

#### 2. Multi-Role Switching
```
1. Login as faculty4@university.edu
2. See role dropdown showing "Faculty"
3. Switch to "Club Coordinator"
4. Dashboard changes to Club Dashboard
5. Switch back to "Faculty"
```

#### 3. Bulk Upload
```
1. Login as admin@university.edu
2. Go to Bulk Upload
3. Download Excel file
4. Modify data (change names, add new rows)
5. Upload modified file
6. Verify results (created/updated/deactivated counts)
```

#### 4. Dark Theme
```
1. Login with any user
2. Click moon icon in header
3. Theme changes to dark
4. Refresh page
5. Theme persists (still dark)
```

---

## 🐛 Troubleshooting

### Backend won't start
**Issue**: Database connection error
**Solution**: 
- Check MySQL is running
- Verify .env database credentials
- Ensure database 'campusflow' exists

### Frontend shows 404 errors
**Issue**: Backend not running
**Solution**: 
- Start backend server: `cd backend && npm start`
- Verify backend runs on port 3000

### Excel upload fails
**Issue**: File format or size
**Solution**:
- Ensure file is .xlsx format
- Check file size < 5MB
- Verify Excel has "Students" worksheet

### Club dashboard fails to load
**Issue**: Backend not restarted after code changes
**Solution**:
- Stop backend (Ctrl+C)
- Restart: `npm start`

### Mind map not generating
**Issue**: AI service not running
**Solution**:
- Start AI service: `cd ai-service && python app.py`
- Verify service runs on port 5000

---

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/login          - User login
POST   /api/auth/register       - User registration
GET    /api/auth/me             - Get current user
```

### Admin
```
GET    /api/admin/dashboard     - Dashboard stats
GET    /api/admin/students      - List students
GET    /api/admin/students/export    - Download Excel
POST   /api/admin/students/import    - Upload Excel
GET    /api/admin/courses       - List courses
POST   /api/admin/courses       - Create course
PUT    /api/admin/courses/:id   - Update course
GET    /api/admin/payments/pending   - Pending payments
PUT    /api/admin/payments/:id/approve  - Approve payment
POST   /api/admin/notifications - Create notification
```

### Student
```
GET    /api/student/dashboard   - Dashboard data
GET    /api/student/hall-tickets - Hall tickets
GET    /api/student/courses     - Enrolled courses
POST   /api/student/mindmap     - Generate mind map
```

### Faculty
```
GET    /api/faculty/dashboard   - Dashboard data
GET    /api/faculty/courses     - Assigned courses
GET    /api/faculty/students    - Student list
```

### Club
```
GET    /api/club/:id/dashboard  - Club dashboard
GET    /api/club/:id/events     - List events
POST   /api/club/:id/events     - Create event
PUT    /api/club/events/:id     - Update event
DELETE /api/club/events/:id     - Cancel event
```

---

## 🚀 Deployment

### Production Build

#### Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

#### Backend
```bash
cd backend
# Set NODE_ENV=production in .env
# Use PM2 or similar for process management
pm2 start src/server.js --name campusflow-backend
```

#### Database
```bash
# Run migrations on production database
cd backend
npm run migrate
# Optionally seed with production data
```

### Environment Variables

**Backend (.env)**:
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=campusflow
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

**Frontend (environment.prod.ts)**:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  aiServiceUrl: 'https://your-ai-service.com/api'
};
```

---

## 📝 Development Notes

### Adding New Features

1. **Backend**: Create controller → service → route
2. **Frontend**: Create component → service → route
3. **Database**: Create migration if schema changes
4. **Test**: Add test credentials to seed file

### Code Style

- **Backend**: CommonJS modules, async/await
- **Frontend**: TypeScript, RxJS observables
- **Naming**: camelCase for variables, PascalCase for classes
- **Comments**: JSDoc for functions

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push to remote
git push origin feature/your-feature

# Create pull request
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 👥 Team

Developed as an integrated academic management solution.

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review error messages in browser console
3. Check backend terminal logs
4. Verify all services are running

---

## ✅ Project Status

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: December 19, 2024

### Completed Features
✅ Role-based authentication  
✅ Multi-role support  
✅ Admin management system  
✅ Student features  
✅ Faculty features  
✅ Club management  
✅ Bulk upload/download  
✅ AI mind map generator  
✅ Dark theme  
✅ Toast notifications  
✅ Seating allocation  
✅ Hall ticket system  
✅ Notification system  

---

**Happy Coding! 🚀**
