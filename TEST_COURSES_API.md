# Testing Courses API

## Issue
Courses dropdown is empty in exam management page.

## Root Cause
The `seatingService.getCourses()` calls `/api/admin/courses` endpoint.

## Solution Steps

### 1. Check if backend is running
```bash
# Backend should be running on port 3000
curl http://localhost:3000/api/admin/courses
```

### 2. Check browser console
Open browser console (F12) and look for:
- "Loading courses..." message
- Any error messages
- Network tab to see if API call is made

### 3. Verify you're logged in as admin/seating manager
- Login as: admin@university.edu / password123
- Or: seating@university.edu / password123

### 4. Check database has courses
The seed data should have created 15 courses. If not, run:
```bash
cd backend
npm run db:reset
```

## Quick Fix Applied

Added console.log statements to exam-management component:
- Logs when courses are being loaded
- Logs the response
- Shows better error messages

## How to Test

1. **Start Backend**:
```bash
cd backend
npm start
```

2. **Start Frontend**:
```bash
cd frontend
npm start
```

3. **Login**:
- Go to http://localhost:4200
- Login as admin@university.edu / password123

4. **Navigate to Exam Management**:
- Click on "Seating Manager" in header (or use role switcher if needed)
- Go to "Exam Management"
- Click "Create New Exam"

5. **Check Console**:
- Open browser console (F12)
- Look for "Loading courses..." message
- Check if courses array is populated

6. **Expected Result**:
- Course dropdown should show 15 courses
- Format: "CS201 - Data Structures", "CS202 - Algorithms", etc.

## If Still Not Working

### Check 1: Backend Route
The route `/api/admin/courses` requires:
- Authentication (JWT token)
- Admin role

### Check 2: Token
- Check localStorage for 'token'
- Token should be sent in Authorization header

### Check 3: Database
Run this query to check courses exist:
```sql
SELECT * FROM courses;
```

Should return 15 courses from seed data.

## Courses in Seed Data

1. CS201 - Data Structures (Semester 4)
2. CS202 - Algorithms (Semester 4)
3. CS301 - Database Systems (Semester 5)
4. CS302 - Operating Systems (Semester 5)
5. CS303 - Computer Networks (Semester 6)
6. ECE201 - Digital Electronics (Semester 3)
7. ECE202 - Microprocessors (Semester 4)
8. ECE301 - VLSI Design (Semester 6)
9. MECH101 - Engineering Mechanics (Semester 1)
10. MECH201 - Thermodynamics (Semester 3)
11. CIVIL201 - Structural Analysis (Semester 4)
12. CIVIL301 - Concrete Technology (Semester 6)
13. EEE201 - Circuit Theory (Semester 3)
14. EEE202 - Electrical Machines (Semester 4)
15. EEE301 - Power Systems (Semester 6)

## Console Output Expected

```
Loading courses...
Courses loaded: {success: true, data: Array(15)}
```

If you see error instead:
```
Failed to load courses: <error message>
```

Check the error message for clues.

---

**Status**: Debugging enabled with console logs
**Next Step**: Check browser console when opening exam management page
