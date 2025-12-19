# Seat Allocation Guide - Step by Step

## Issue
- Exam list is empty in Seat Allocation dropdown
- Exams showing as "draft" status

## Why This Happens
The Seat Allocation dropdown only shows **PUBLISHED** exams. Draft exams are not shown because they're not ready for seat allocation yet.

## Solution: Publish Your Exam First

### Step 1: Create an Exam
1. Go to **Exam Management**
2. Click **"Create New Exam"**
3. Fill in details and add subjects
4. Click **"Create Exam"**
5. ✅ Exam is created with status **"draft"**

### Step 2: Publish the Exam
1. In the exam list, find your exam (it will show status badge as "draft")
2. Click **"View"** button on the exam card
3. In the exam details modal, you'll see a **"Publish Exam"** button (green button)
4. Click **"Publish Exam"**
5. Confirm the action
6. ✅ Exam status changes to **"published"**
7. ✅ Students enrolled in exam courses receive notifications

### Step 3: Allocate Seats
1. Go to **Seat Allocation**
2. Now your published exam will appear in the dropdown
3. Select the exam
4. Configure settings:
   - Seat Spacing: 1, 2, or 3 seats apart
   - Exclude Detained: Yes/No
   - Randomize: Yes/No
5. Click **"Allocate Seats"**
6. ✅ Seats are allocated

### Step 4: View Results
After allocation:
- Click **"View Seating Chart"** to see room-wise seating
- Click **"Generate Hall Tickets"** to create tickets for students

## Quick Test Flow

### Test Data
- **Login**: `seating@university.edu` / `password123`
- **Available Courses**: 15 courses (CS201, CS202, etc.)

### Complete Test
```
1. Login as seating manager
2. Exam Management → Create New Exam
   - Name: "Test Exam Dec 2024"
   - Type: Mid-Term
   - Start: 2024-12-25
   - End: 2024-12-30
   
3. Add Subject
   - Course: CS201 - Data Structures
   - Date: 2024-12-26
   - Time: 09:00 - 11:00
   - Duration: 120 min
   - Marks: 100
   
4. Create Exam → ✅ Success

5. View Exam → Publish Exam → ✅ Published

6. Seat Allocation → Select "Test Exam Dec 2024"
   - Spacing: 1 seat
   - Exclude Detained: Yes
   - Randomize: No
   
7. Allocate Seats → ✅ Allocated

8. View Seating Chart → See room-wise allocation
```

## Exam Status Flow

```
CREATE → draft
   ↓
PUBLISH → published (appears in seat allocation)
   ↓
ALLOCATE → seats assigned
   ↓
GENERATE → hall tickets created
```

## Troubleshooting

### "No exams in dropdown"
**Cause**: No published exams exist
**Solution**: Publish at least one exam first

### "Exam shows as draft"
**Cause**: Exam not published yet
**Solution**: Click View → Publish Exam button

### "Publish button not visible"
**Cause**: Exam already published
**Solution**: Check exam status badge - if it says "published", it's already done

### "Failed to allocate seats"
**Possible causes**:
1. No students enrolled in exam courses
2. No rooms available
3. Exam not published

**Solution**: 
- Check backend console for error details
- Verify students are enrolled in courses
- Verify rooms exist in database

## Backend Verification

### Check if exam is published:
```bash
cd backend
node -e "require('dotenv').config(); const db = require('./src/config/database'); db.query('SELECT id, exam_name, status FROM exams').then(([rows]) => { console.log('Exams:'); rows.forEach(r => console.log(\`  \${r.id}: \${r.exam_name} - \${r.status}\`)); process.exit(0); });"
```

### Check published exams:
```bash
node -e "require('dotenv').config(); const db = require('./src/config/database'); db.query('SELECT id, exam_name FROM exams WHERE status = \"published\"').then(([rows]) => { console.log('Published exams:', rows.length); rows.forEach(r => console.log(\`  - \${r.exam_name}\`)); process.exit(0); });"
```

## UI Indicators

### Exam Status Badges
- **Gray badge "draft"**: Not published yet, won't appear in seat allocation
- **Green badge "published"**: Published, will appear in seat allocation
- **Blue badge "ongoing"**: Exam in progress
- **Info badge "completed"**: Exam finished
- **Red badge "cancelled"**: Exam cancelled

### Buttons Available by Status
- **Draft**: View, Publish, Delete
- **Published**: View, Delete (if no allocations)
- **With Allocations**: View only (can't delete)

## Important Notes

1. **You must publish an exam** before it appears in seat allocation
2. **Publishing sends notifications** to enrolled students
3. **Can't delete exams** with seat allocations (must clear allocations first)
4. **Seat allocation** only works for published exams
5. **Hall tickets** can only be generated after seat allocation

## Success Checklist

Before allocating seats, ensure:
- ✅ Exam created with subjects
- ✅ Exam published (status = "published")
- ✅ Students enrolled in exam courses
- ✅ Rooms available in database
- ✅ Exam appears in seat allocation dropdown

---

**Status**: System working correctly
**Issue**: User needs to publish exam first
**Solution**: Follow Step 2 above to publish exam
