# 🔐 Seating Manager Login Guide

## Issue Fixed ✅

The seating manager login issue has been resolved. The problem was a route mismatch:
- **Old route**: `/seating/dashboard` 
- **Correct route**: `/seating-manager`

## Login Credentials

### Seating Manager Account
```
Email: seating@university.edu
Password: password123
Role: seating_manager
```

### Alternative: Admin Account (Also has seating manager access)
```
Email: admin@university.edu
Password: password123
Roles: admin, seating_manager
```

## How to Login

1. **Navigate to**: `http://localhost:4200/login`

2. **Enter credentials**:
   - Email: `seating@university.edu`
   - Password: `password123`

3. **After login**, you'll be automatically redirected to:
   - `/seating-manager` (Seating Manager Dashboard)

## Direct Access

If you're already logged in as admin or seating manager:
- **URL**: `http://localhost:4200/seating-manager`

## Features Available

Once logged in, you can access:

### 1. Dashboard (`/seating-manager`)
- Quick stats overview
- Recent allocations
- Upcoming exams
- Quick action buttons

### 2. Seat Allocation (`/seating-manager/allocate`)
- Select exam
- Configure spacing (1, 2, or 3 seats)
- Exclude detained students
- Randomize seating
- View statistics
- Export to CSV

### 3. Hall Ticket Generation (`/seating-manager/hall-tickets`)
- Bulk generate tickets
- Auto-approve option
- Download tickets
- View statistics
- Approve pending tickets

### 4. Seating Chart (`/seating-manager/chart/:examId`)
- Room-wise breakdown
- Student lists
- Search and filter
- Export to CSV
- Print view

## Troubleshooting

### Can't Login?
1. Make sure backend is running: `cd backend && npm run dev`
2. Make sure database is seeded: `cd backend && npx knex seed:run`
3. Check browser console for errors
4. Clear browser cache and localStorage

### Redirected to Wrong Page?
- The system now correctly redirects seating managers to `/seating-manager`
- If you have multiple roles, you can switch roles using the role switcher

### Access Denied?
- Make sure you're logged in with the correct role
- Seating manager routes require `seating_manager` or `admin` role
- Check the auth guard configuration in `app-routing.module.ts`

## Multiple Roles

Some users have multiple roles:
- **Admin** (`admin@university.edu`): Has both `admin` and `seating_manager` roles
- **Faculty 1** (`faculty1@university.edu`): Has both `faculty` and `admin` roles

You can switch between roles using the role switcher component in the header.

## Database Setup

If you need to reset the database:

```bash
cd backend

# Drop all tables
npx knex migrate:rollback --all

# Run migrations
npx knex migrate:latest

# Seed data
npx knex seed:run
```

This will create:
- 1 Seating Manager user
- 1 Admin user (with seating manager access)
- 12 Students
- 4 Faculty members
- 8 Exams
- 10 Rooms
- Sample allocations

## API Endpoints

The seating manager uses these endpoints:

```
POST   /api/seating/allocate
GET    /api/seating/chart/:examId
GET    /api/seating/statistics/:examId
DELETE /api/seating/allocations/:examId
POST   /api/seating/hall-tickets/generate
GET    /api/seating/hall-tickets/:examId
POST   /api/seating/hall-tickets/approve
GET    /api/admin/exams
```

All endpoints require authentication with JWT token.

## Success! 🎉

You should now be able to:
1. ✅ Login as seating manager
2. ✅ Access seating manager dashboard
3. ✅ Allocate seats for exams
4. ✅ Generate hall tickets
5. ✅ View seating charts
6. ✅ Export data

---

**Last Updated**: December 2024
**Status**: ✅ Working
