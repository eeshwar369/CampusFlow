# CampusFlow - Academic Exam Management System

A comprehensive full-stack web application for managing academic examinations, seating allocations, hall tickets, and student activities in educational institutions.

## 🎯 Project Overview

CampusFlow is an enterprise-grade exam management system that streamlines the entire examination process from exam creation to hall ticket generation. The system supports multiple user roles and provides intelligent seating allocation with conflict detection.

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Angular 15+ (TypeScript)
- RxJS for reactive programming
- Angular Material & Custom SCSS
- JWT-based authentication
- Responsive design

**Backend:**
- Node.js with Express.js
- RESTful API architecture
- JWT authentication & authorization
- Knex.js query builder
- MySQL2 database driver

**Database:**
- MySQL 8.0+
- Knex.js migrations & seeds
- Relational database design
- Foreign key constraints

**AI Service:**
- Python Flask
- PDF processing (PyPDF2)
- Mind map generation
- Study recommendations

### System Architecture

```
┌─────────────────┐
│   Angular SPA   │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Express API   │
│   (Backend)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│ MySQL │ │ Python  │
│  DB   │ │ AI Svc  │
└───────┘ └─────────┘
```

## 👥 User Roles & Features

### 1. Admin
**Dashboard Features:**
- System-wide statistics
- User management
- Course management
- Payment approvals
- Hall ticket approvals
- Event approvals
- Report generation

**Key Capabilities:**
- Manage students, faculty, and courses
- Approve/reject fee payments
- Approve/reject hall tickets
- Bulk upload students via Excel
- Generate analytical reports
- Publish system-wide notifications
- Audit log access

### 2. Seating Manager (New Role)
**Dashboard Features:**
- Exam management
- Seat allocation
- Seating chart visualization
- Hall ticket generation

**Exam Management:**
- Create exams with multiple subjects
- Add subjects from course catalog
- Set exam dates, times, and durations
- Publish exams (triggers student notifications)
- View exam schedule
- Delete draft exams

**Seat Allocation:**
- Intelligent seat distribution
- Configurable spacing (1, 2, or 3 seats apart)
- Exclude detained students option
- Randomize or alphabetical ordering
- Room capacity management
- Conflict detection

**Seating Chart:**
- Room-wise student allocation
- Visual seating layout
- Export to CSV/PDF
- Print-friendly format

**Hall Ticket Generation:**
- Bulk generation for allocated students
- QR code integration
- PDF export
- Approval workflow

### 3. Student
**Dashboard Features:**
- Course enrollment
- Notifications
- Hall tickets
- Events participation
- AI-powered study tools

**Key Capabilities:**
- View enrolled courses
- Receive exam notifications
- Download hall tickets
- View seating allocation
- Participate in events
- Upload study materials
- Generate mind maps (AI)
- Get study recommendations

### 4. Faculty
**Dashboard Features:**
- Course management
- Student performance tracking
- Attendance management
- Grade submission

**Key Capabilities:**
- Manage assigned courses
- Mark attendance
- Submit grades
- View student performance
- Generate course reports

### 5. Club Coordinator
**Dashboard Features:**
- Event management
- Member management
- Participation approvals

**Key Capabilities:**
- Create and manage events
- Manage club members
- Approve participation requests
- Track event attendance

## 🎓 Core Features

### Exam Management System

#### 1. Exam Creation
```typescript
// Exam Structure
{
  exam_name: string,
  exam_type: 'mid-term' | 'end-term' | 'regular' | 'supplementary',
  start_date: Date,
  end_date: Date,
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled',
  subjects: [
    {
      courseId: number,
      examDate: Date,
      startTime: Time,
      endTime: Time,
      durationMinutes: number,
      totalMarks: number
    }
  ]
}
```

**Features:**
- Multi-subject exam support
- Flexible date ranges
- Course-based subject selection
- Draft and publish workflow

#### 2. Exam Publishing
**Workflow:**
1. Seating manager creates exam (status: draft)
2. Adds subjects from course catalog
3. Publishes exam
4. System finds students enrolled in exam courses
5. Sends personalized notifications to enrolled students
6. Exam becomes available for seat allocation

**Smart Notifications:**
- Only students enrolled in exam courses are notified
- Personalized message with subject count
- In-app notifications
- Email notifications (configurable)

#### 3. Seat Allocation Algorithm

**Input Parameters:**
- Exam ID
- Spacing (1, 2, or 3 seats apart)
- Exclude detained students (boolean)
- Randomize seating (boolean)

**Algorithm Steps:**
```
1. Get exam courses from exam_schedule table
2. Find students enrolled in those courses
3. Filter out detained students (if enabled)
4. Sort students (alphabetical or random)
5. Get available rooms (ordered by capacity)
6. Calculate effective capacity with spacing
7. Allocate students to seats room by room
8. Generate seat numbers (RoomName-001, RoomName-002, etc.)
9. Save allocations to database
10. Return allocation statistics
```

**Spacing Logic:**
- **Spacing 1**: Normal density (100% capacity)
- **Spacing 2**: Social distancing (50% capacity)
- **Spacing 3**: Maximum spacing (33% capacity)

**Example:**
```
Room: Auditorium (Capacity: 100)
Students: 60
Spacing: 2

Effective Capacity: 100 / 2 = 50 seats
Result: 50 students in Auditorium, 10 in next room
```

#### 4. Seating Chart
**Features:**
- Room-wise breakdown
- Student details (roll number, name)
- Seat numbers
- Utilization percentage
- Export to CSV/PDF
- Print-friendly layout

#### 5. Hall Ticket Generation
**Components:**
- Student information
- Exam details
- Subject schedule
- Seating allocation
- QR code for verification
- Barcode
- Instructions

### Course Management

**Course Structure:**
```sql
courses:
  - id
  - name
  - code
  - department
  - semester
  - credits
  - year
  - faculty_id
```

**Features:**
- Department-wise organization
- Semester-based grouping
- Credit system
- Faculty assignment
- Course enrollment tracking

### Notification System

**Types:**
- Exam announcements
- Event notifications
- Payment status
- Hall ticket status
- System alerts

**Delivery:**
- In-app notifications (real-time)
- User-specific notifications
- Role-based notifications
- Read/unread tracking

### Event Management

**Event Lifecycle:**
1. Club coordinator creates event
2. Admin reviews and approves
3. Event published to students
4. Students register for participation
5. Club coordinator approves participants
6. Event conducted
7. Attendance marked

**Features:**
- Event categories
- Capacity management
- Registration deadlines
- Approval workflow
- Participation certificates

### AI-Powered Study Tools

**Mind Map Generation:**
- Upload PDF study materials
- AI extracts key concepts
- Generates visual mind maps
- Interactive exploration

**Study Recommendations:**
- Analyzes student performance
- Suggests focus areas
- Personalized study plans
- Resource recommendations

## 📊 Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### students
```sql
CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  roll_number VARCHAR(50) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  semester INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### courses
```sql
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  semester INT NOT NULL,
  credits INT NOT NULL,
  year INT,
  faculty_id INT,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id)
);
```

#### exams
```sql
CREATE TABLE exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_name VARCHAR(255) NOT NULL,
  exam_type VARCHAR(50) DEFAULT 'regular',
  start_date DATE,
  end_date DATE,
  status ENUM('draft', 'published', 'ongoing', 'completed', 'cancelled'),
  created_by INT,
  published_by INT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (published_by) REFERENCES users(id)
);
```

#### exam_schedule
```sql
CREATE TABLE exam_schedule (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL,
  course_id INT NOT NULL,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  total_marks INT DEFAULT 100,
  instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

#### seating_allocations
```sql
CREATE TABLE seating_allocations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL,
  student_id INT NOT NULL,
  room_id INT NOT NULL,
  seat_number VARCHAR(50) NOT NULL,
  seat_position INT NOT NULL,
  allocated_by INT,
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (allocated_by) REFERENCES users(id)
);
```

#### rooms
```sql
CREATE TABLE rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_name VARCHAR(100) NOT NULL,
  building VARCHAR(100),
  floor INT,
  capacity INT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### course_enrollments
```sql
CREATE TABLE course_enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  semester INT NOT NULL,
  year INT NOT NULL,
  status VARCHAR(50) DEFAULT 'enrolled',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

#### notifications
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(50),
  target_roles JSON,
  created_by INT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### user_notifications
```sql
CREATE TABLE user_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  notification_id INT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (notification_id) REFERENCES notifications(id)
);
```

### Additional Tables
- faculty
- hall_tickets
- fee_payments
- events
- event_participations
- clubs
- club_members
- student_academic_status
- attendance
- student_performance
- audit_logs
- seating_configurations
- seating_blueprints
- bulk_uploads

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- MySQL 8.0+
- Python 3.8+ (for AI service)
- Angular CLI 15+

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
ng serve
```

### AI Service Setup

```bash
# Navigate to AI service directory
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

### Database Configuration

**backend/.env:**
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=campusflow

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

AI_SERVICE_URL=http://localhost:5000
```

## 🔐 Authentication & Authorization

### JWT-Based Authentication

**Login Flow:**
```
1. User submits credentials
2. Backend validates credentials
3. Generate JWT token with user info
4. Return token to frontend
5. Frontend stores token in localStorage
6. Include token in all API requests
7. Backend validates token on each request
```

**Token Payload:**
```typescript
{
  id: number,
  email: string,
  role: string,
  studentId?: number,
  facultyId?: number,
  iat: number,
  exp: number
}
```

### Role-Based Access Control

**Middleware:**
```javascript
// Authenticate - verify JWT token
authenticate(req, res, next)

// Authorize - check user role
authorize(['admin', 'seating_manager'])(req, res, next)
```

**Route Protection:**
```javascript
router.get('/admin/dashboard', 
  authenticate, 
  authorize(['admin']), 
  adminController.getDashboard
);

router.post('/seating/allocate', 
  authenticate, 
  authorize(['seating_manager', 'admin']), 
  seatingController.allocateSeats
);
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/login          - User login
POST   /api/auth/register       - User registration
POST   /api/auth/logout         - User logout
GET    /api/auth/profile        - Get user profile
```

### Admin
```
GET    /api/admin/dashboard     - Dashboard statistics
GET    /api/admin/students      - List students
POST   /api/admin/students      - Create student
PUT    /api/admin/students/:id  - Update student
GET    /api/admin/courses       - List courses
POST   /api/admin/courses       - Create course
GET    /api/admin/payments      - Pending payments
POST   /api/admin/payments/:id/approve - Approve payment
POST   /api/admin/bulk-upload   - Bulk upload students
GET    /api/admin/reports       - Generate reports
```

### Seating Manager
```
POST   /api/seating/exams                    - Create exam
GET    /api/seating/exams                    - List all exams
GET    /api/seating/exams/published          - List published exams
GET    /api/seating/exams/:id                - Get exam details
PUT    /api/seating/exams/:id                - Update exam
DELETE /api/seating/exams/:id                - Delete exam
POST   /api/seating/exams/:id/publish        - Publish exam
POST   /api/seating/exams/:id/subjects       - Add subject
DELETE /api/seating/exams/subjects/:id       - Remove subject
POST   /api/seating/allocate                 - Allocate seats
GET    /api/seating/chart/:examId            - Get seating chart
GET    /api/seating/statistics/:examId       - Get statistics
DELETE /api/seating/allocations/:examId      - Clear allocations
POST   /api/seating/hall-tickets/generate    - Generate hall tickets
GET    /api/seating/hall-tickets/:examId     - Get hall tickets
GET    /api/seating/courses                  - Get courses
```

### Student
```
GET    /api/student/dashboard        - Dashboard data
GET    /api/student/courses          - Enrolled courses
GET    /api/student/notifications    - User notifications
PUT    /api/student/notifications/:id/read - Mark as read
GET    /api/student/hall-tickets     - Student hall tickets
GET    /api/student/events           - Available events
POST   /api/student/events/:id/register - Register for event
POST   /api/student/mindmap          - Generate mind map
```

### Faculty
```
GET    /api/faculty/dashboard        - Dashboard data
GET    /api/faculty/courses          - Assigned courses
POST   /api/faculty/attendance       - Mark attendance
POST   /api/faculty/grades           - Submit grades
GET    /api/faculty/students/:courseId - Course students
```

### Club
```
POST   /api/club/events              - Create event
GET    /api/club/events              - List club events
PUT    /api/club/events/:id          - Update event
DELETE /api/club/events/:id          - Delete event
GET    /api/club/members             - List members
POST   /api/club/members             - Add member
GET    /api/club/participations      - Pending participations
POST   /api/club/participations/:id/approve - Approve participation
```

## 🎨 Frontend Architecture

### Module Structure

```
src/app/
├── components/          # Shared components
│   ├── header/
│   ├── login/
│   ├── toast/
│   └── role-switcher/
├── modules/            # Feature modules
│   ├── admin/
│   │   ├── admin-dashboard/
│   │   ├── manage-students/
│   │   ├── manage-courses/
│   │   ├── approve-payments/
│   │   ├── approve-hall-tickets/
│   │   ├── approve-events/
│   │   ├── bulk-upload/
│   │   ├── generate-reports/
│   │   └── publish-notifications/
│   ├── seating-manager/
│   │   ├── seating-manager-dashboard/
│   │   ├── exam-management/
│   │   ├── seat-allocation/
│   │   ├── seating-chart/
│   │   └── hall-ticket-generation/
│   ├── student/
│   │   ├── student-dashboard/
│   │   ├── notifications/
│   │   ├── hall-tickets/
│   │   ├── events/
│   │   └── mindmap/
│   ├── faculty/
│   │   └── faculty-dashboard/
│   └── club/
│       ├── club-dashboard/
│       ├── event-management/
│       ├── members/
│       └── approve-participations/
├── services/           # API services
│   ├── auth.service.ts
│   ├── admin.service.ts
│   ├── seating.service.ts
│   ├── student.service.ts
│   ├── faculty.service.ts
│   ├── club.service.ts
│   ├── toast.service.ts
│   └── theme.service.ts
├── guards/             # Route guards
│   └── auth.guard.ts
├── interceptors/       # HTTP interceptors
│   └── auth.interceptor.ts
├── models/             # TypeScript interfaces
│   └── user.model.ts
└── shared/             # Shared module
    └── shared.module.ts
```

### State Management
- Service-based state management
- RxJS BehaviorSubjects for reactive state
- LocalStorage for persistence
- JWT token management

### Routing
```typescript
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin', 
    loadChildren: () => import('./modules/admin/admin.module'),
    canActivate: [AuthGuard],
    data: { role: 'admin' }
  },
  { 
    path: 'seating-manager', 
    loadChildren: () => import('./modules/seating-manager/seating-manager.module'),
    canActivate: [AuthGuard],
    data: { role: 'seating_manager' }
  },
  { 
    path: 'student', 
    loadChildren: () => import('./modules/student/student.module'),
    canActivate: [AuthGuard],
    data: { role: 'student' }
  },
  // ... other routes
];
```

## 🧪 Testing

### Test Credentials

**Admin:**
- Email: `admin@university.edu`
- Password: `password123`

**Seating Manager:**
- Email: `seating@university.edu`
- Password: `password123`

**Students:**
- Email: `student1@university.edu` to `student12@university.edu`
- Password: `password123`

**Faculty:**
- Email: `faculty1@university.edu` to `faculty4@university.edu`
- Password: `password123`

**Club Coordinator:**
- Email: `club@university.edu`
- Password: `password123`

### Test Data

**Seeded Data:**
- 19 Users (1 Admin, 12 Students, 4 Faculty, 2 Staff)
- 12 Students across 5 departments
- 4 Faculty members
- 15 Courses
- 10 Rooms
- 8 Exams
- 16 Course Enrollments
- 3 Clubs
- 4 Events

## 📝 Usage Guide

### Complete Exam Management Flow

#### 1. Create Exam
```
Login as Seating Manager
→ Exam Management
→ Create New Exam
→ Fill details:
   - Name: "Mid-Term Exam December 2024"
   - Type: Mid-Term
   - Start Date: 2024-12-25
   - End Date: 2024-12-30
→ Add Subjects:
   - Course: CS201 - Data Structures
   - Date: 2024-12-26
   - Time: 09:00 - 11:00
   - Duration: 120 minutes
   - Marks: 100
→ Create Exam
✓ Exam created with status "draft"
```

#### 2. Publish Exam
```
→ View Exam
→ Click "Publish Exam"
→ Confirm
✓ Exam status: "published"
✓ Students enrolled in CS201 receive notifications
✓ Exam appears in Seat Allocation dropdown
```

#### 3. Allocate Seats
```
→ Seat Allocation
→ Select "Mid-Term Exam December 2024"
→ Configure:
   - Spacing: 1 seat apart
   - Exclude Detained: Yes
   - Randomize: No
→ Allocate Seats
✓ Seats allocated
✓ Statistics displayed:
   - Total Students: 50
   - Allocated: 50
   - Rooms Used: 1
```

#### 4. View Seating Chart
```
→ View Seating Chart
✓ Room-wise breakdown
✓ Student details with seat numbers
✓ Export to CSV/PDF
```

#### 5. Generate Hall Tickets
```
→ Hall Ticket Generation
→ Select Exam
→ Generate Tickets
✓ Hall tickets created for all allocated students
✓ QR codes generated
✓ Ready for download
```

#### 6. Student Views Hall Ticket
```
Login as Student
→ Hall Tickets
✓ View exam details
✓ View seating allocation
✓ Download PDF
✓ Print hall ticket
```

## 🔧 Configuration

### Backend Configuration

**Database Migrations:**
```bash
# Create new migration
npx knex migrate:make migration_name

# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Reset database
npm run db:reset
```

**Environment Variables:**
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=campusflow

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# File Upload
MAX_FILE_SIZE_SYLLABUS=10485760
MAX_FILE_SIZE_EVENT=5242880
UPLOAD_DIR=./uploads

# AI Service
AI_SERVICE_URL=http://localhost:5000

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_password

# Security
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:4200
```

### Frontend Configuration

**environment.ts:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  aiServiceUrl: 'http://localhost:5000'
};
```

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```
Error: Unknown database 'campusflow'
Solution: Create database manually
  mysql -u root -p
  CREATE DATABASE campusflow;
```

**2. Migration Failed**
```
Error: Table already exists
Solution: Rollback and re-run
  npm run migrate:rollback
  npm run migrate
```

**3. JWT Token Invalid**
```
Error: 401 Unauthorized
Solution: Clear localStorage and login again
  localStorage.clear()
```

**4. CORS Error**
```
Error: CORS policy blocked
Solution: Check CORS_ORIGIN in .env matches frontend URL
```

**5. Port Already in Use**
```
Error: EADDRINUSE :::3000
Solution: Kill process or change port
  Windows: netstat -ano | findstr :3000
          taskkill /F /PID <PID>
  Linux: lsof -ti:3000 | xargs kill
```

## 📈 Performance Optimization

### Backend
- Database indexing on frequently queried columns
- Connection pooling (10 connections)
- Query optimization with Knex.js
- Caching with Redis (optional)
- Rate limiting (100 requests per 15 minutes)

### Frontend
- Lazy loading modules
- OnPush change detection strategy
- RxJS operators for efficient data streams
- Image optimization
- Code splitting

### Database
- Indexed columns: email, roll_number, course_code
- Foreign key constraints
- Optimized JOIN queries
- Pagination for large datasets

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- Role-based access control
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF protection
- Rate limiting
- Helmet.js security headers
- Input validation with Joi
- Audit logging

## 📦 Deployment

### Production Build

**Backend:**
```bash
# Set environment
NODE_ENV=production

# Run migrations
npm run migrate

# Start server
npm start
```

**Frontend:**
```bash
# Build for production
ng build --configuration production

# Output in dist/ folder
# Deploy to web server (Nginx, Apache, etc.)
```

### Docker Deployment (Optional)

```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```dockerfile
# Frontend Dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Development Team

- **Backend Development**: Node.js, Express, MySQL
- **Frontend Development**: Angular, TypeScript, SCSS
- **AI Service**: Python, Flask, Machine Learning
- **Database Design**: MySQL, Knex.js migrations

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@campusflow.edu
- Documentation: [Wiki](https://github.com/campusflow/wiki)

## 🎉 Acknowledgments

- Angular team for the amazing framework
- Express.js community
- MySQL database
- All open-source contributors

---

**Version**: 1.0.0  
**Last Updated**: December 20, 2024  
**Status**: Production Ready ✅
