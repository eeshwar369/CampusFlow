const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  console.log('🌱 Starting comprehensive seed...\n');

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Clear existing data (in correct order due to foreign keys)
  await knex('seating_allocations').del();
  await knex('hall_tickets').del();
  await knex('fee_payments').del();
  await knex('course_enrollments').del();
  await knex('notifications').del();
  await knex('student_academic_status').del();
  await knex('exam_schedule').del();
  await knex('exams').del();
  await knex('rooms').del();
  await knex('courses').del();
  await knex('club_members').del();
  await knex('clubs').del();
  await knex('events').del();
  await knex('faculty').del();
  await knex('students').del();
  await knex('users').del();

  // 1. Insert Users (20 users)
  console.log('👥 Seeding users...');
  await knex('users').insert([
    // Admin (also has faculty role)
    { id: 1, email: 'admin@university.edu', password_hash: hashedPassword, role: 'admin', roles: JSON.stringify(['admin', 'faculty']), first_name: 'Admin', last_name: 'User', is_active: true },
    
    // Students (12)
    { id: 2, email: 'student1@university.edu', password_hash: hashedPassword, role: 'student', roles: JSON.stringify(['student']), first_name: 'John', last_name: 'Doe', is_active: true },
    { id: 3, email: 'student2@university.edu', password_hash: hashedPassword, role: 'student', roles: JSON.stringify(['student']), first_name: 'Jane', last_name: 'Smith', is_active: true },
    { id: 4, email: 'student3@university.edu', password_hash: hashedPassword, role: 'student', roles: JSON.stringify(['student']), first_name: 'Bob', last_name: 'Johnson', is_active: true },
    { id: 5, email: 'student4@university.edu', password_hash: hashedPassword, role: 'student', roles: JSON.stringify(['student']), first_name: 'Alice', last_name: 'Williams', is_active: true },
    { id: 6, email: 'student5@university.edu', password_hash: hashedPassword, role: 'student', roles: JSON.stringify(['student']), first_name: 'Charlie', last_name: 'Brown', is_active: true },
    { id: 7, email: 'student6@university.edu', password_hash: hashedPassword, role: 'student', roles: JSON.stringify(['student']), first_name: 'Diana', last_name: 'Davis', is_active: true },
    { id: 8, email: 'student7@university.edu', password_hash: hashedPassword, role: 'student', roles: JSON.stringify(['student']), first_name: 'Eve', last_name: 'Miller', is_active: true },
    { id: 9, email: 'student8@university.edu', password_hash: hashedPassword, role: 'student', roles: JSON.stringify(['student']), first_name: 'Frank', last_name: 'Wilson', is_active: true },
    { id: 10, email: 'student9@university.edu', password_hash: hashedPassword, role: 'student', roles: JSON.stringify(['student']), first_name: 'Grace', last_name: 'Moore', is_active: true },
    { id: 11, email: 'student10@university.edu', password_hash: hashedPassword, role: 'student', roles: JSON.stringify(['student']), first_name: 'Henry', last_name: 'Taylor', is_active: true },
    { id: 12, email: 'student11@university.edu', password_hash: hashedPassword, role: 'student', roles: JSON.stringify(['student']), first_name: 'Ivy', last_name: 'Anderson', is_active: true },
    { id: 13, email: 'student12@university.edu', password_hash: hashedPassword, role: 'student', roles: JSON.stringify(['student']), first_name: 'Jack', last_name: 'Thomas', is_active: true },
    
    // Faculty (4) - Faculty 1 also has admin role
    { id: 14, email: 'faculty1@university.edu', password_hash: hashedPassword, role: 'faculty', roles: JSON.stringify(['faculty', 'admin']), first_name: 'Dr. Sarah', last_name: 'Williams', is_active: true },
    { id: 15, email: 'faculty2@university.edu', password_hash: hashedPassword, role: 'faculty', roles: JSON.stringify(['faculty']), first_name: 'Prof. Michael', last_name: 'Brown', is_active: true },
    { id: 16, email: 'faculty3@university.edu', password_hash: hashedPassword, role: 'faculty', roles: JSON.stringify(['faculty']), first_name: 'Dr. Emily', last_name: 'Jones', is_active: true },
    { id: 17, email: 'faculty4@university.edu', password_hash: hashedPassword, role: 'faculty', roles: JSON.stringify(['faculty', 'club_coordinator']), first_name: 'Prof. David', last_name: 'Garcia', is_active: true },
    
    // Staff - Seating manager also has admin access
    { id: 18, email: 'seating@university.edu', password_hash: hashedPassword, role: 'seating_manager', roles: JSON.stringify(['seating_manager', 'admin']), first_name: 'Seating', last_name: 'Manager', is_active: true },
    { id: 19, email: 'club@university.edu', password_hash: hashedPassword, role: 'club_coordinator', roles: JSON.stringify(['club_coordinator']), first_name: 'Club', last_name: 'Coordinator', is_active: true }
  ]);

  // 2. Insert Students (12 students)
  console.log('🎓 Seeding students...');
  await knex('students').insert([
    { id: 1, user_id: 2, roll_number: 'CS2024001', department: 'Computer Science', year: 2, semester: 4 },
    { id: 2, user_id: 3, roll_number: 'CS2024002', department: 'Computer Science', year: 2, semester: 4 },
    { id: 3, user_id: 4, roll_number: 'CS2024003', department: 'Computer Science', year: 3, semester: 5 },
    { id: 4, user_id: 5, roll_number: 'CS2024004', department: 'Computer Science', year: 3, semester: 5 },
    { id: 5, user_id: 6, roll_number: 'ECE2024001', department: 'Electronics', year: 2, semester: 3 },
    { id: 6, user_id: 7, roll_number: 'ECE2024002', department: 'Electronics', year: 2, semester: 3 },
    { id: 7, user_id: 8, roll_number: 'ECE2024003', department: 'Electronics', year: 3, semester: 6 },
    { id: 8, user_id: 9, roll_number: 'MECH2024001', department: 'Mechanical', year: 1, semester: 2 },
    { id: 9, user_id: 10, roll_number: 'MECH2024002', department: 'Mechanical', year: 1, semester: 2 },
    { id: 10, user_id: 11, roll_number: 'CIVIL2024001', department: 'Civil', year: 4, semester: 7 },
    { id: 11, user_id: 12, roll_number: 'CIVIL2024002', department: 'Civil', year: 4, semester: 7 },
    { id: 12, user_id: 13, roll_number: 'EEE2024001', department: 'Electrical', year: 2, semester: 4 }
  ]);

  // 3. Insert Faculty (4 faculty)
  console.log('👨‍🏫 Seeding faculty...');
  await knex('faculty').insert([
    { id: 1, user_id: 14, employee_id: 'FAC001', department: 'Computer Science', designation: 'Associate Professor', specialization: 'Data Structures & Algorithms' },
    { id: 2, user_id: 15, employee_id: 'FAC002', department: 'Computer Science', designation: 'Professor', specialization: 'Database Systems' },
    { id: 3, user_id: 16, employee_id: 'FAC003', department: 'Electronics', designation: 'Assistant Professor', specialization: 'Digital Electronics' },
    { id: 4, user_id: 17, employee_id: 'FAC004', department: 'Mechanical', designation: 'Professor', specialization: 'Thermodynamics' }
  ]);

  // 4. Insert Courses (15 courses) - Now with faculty assignments
  console.log('📚 Seeding courses...');
  await knex('courses').insert([
    // Computer Science - Faculty 1 (Dr. Sarah Williams)
    { id: 1, name: 'Data Structures', code: 'CS201', department: 'Computer Science', semester: 4, credits: 4, year: 2, faculty_id: 1 },
    { id: 2, name: 'Algorithms', code: 'CS202', department: 'Computer Science', semester: 4, credits: 4, year: 2, faculty_id: 1 },
    // Computer Science - Faculty 2 (Prof. Michael Brown)
    { id: 3, name: 'Database Systems', code: 'CS301', department: 'Computer Science', semester: 5, credits: 3, year: 3, faculty_id: 2 },
    { id: 4, name: 'Operating Systems', code: 'CS302', department: 'Computer Science', semester: 5, credits: 4, year: 3, faculty_id: 2 },
    { id: 5, name: 'Computer Networks', code: 'CS303', department: 'Computer Science', semester: 6, credits: 3, year: 3, faculty_id: 1 },
    
    // Electronics - Faculty 3 (Dr. Emily Jones)
    { id: 6, name: 'Digital Electronics', code: 'ECE201', department: 'Electronics', semester: 3, credits: 4, year: 2, faculty_id: 3 },
    { id: 7, name: 'Microprocessors', code: 'ECE202', department: 'Electronics', semester: 4, credits: 4, year: 2, faculty_id: 3 },
    { id: 8, name: 'VLSI Design', code: 'ECE301', department: 'Electronics', semester: 6, credits: 3, year: 3, faculty_id: 3 },
    
    // Mechanical - Faculty 4 (Prof. David Garcia)
    { id: 9, name: 'Engineering Mechanics', code: 'MECH101', department: 'Mechanical', semester: 1, credits: 4, year: 1, faculty_id: 4 },
    { id: 10, name: 'Thermodynamics', code: 'MECH201', department: 'Mechanical', semester: 3, credits: 4, year: 2, faculty_id: 4 },
    
    // Civil - Assign to Faculty 1 (can teach multiple departments)
    { id: 11, name: 'Structural Analysis', code: 'CIVIL301', department: 'Civil', semester: 5, credits: 4, year: 3, faculty_id: 1 },
    { id: 12, name: 'Construction Management', code: 'CIVIL401', department: 'Civil', semester: 7, credits: 3, year: 4, faculty_id: 1 },
    
    // Electrical - Assign to Faculty 2
    { id: 13, name: 'Circuit Theory', code: 'EEE201', department: 'Electrical', semester: 3, credits: 4, year: 2, faculty_id: 2 },
    { id: 14, name: 'Power Systems', code: 'EEE301', department: 'Electrical', semester: 5, credits: 4, year: 3, faculty_id: 2 },
    { id: 15, name: 'Control Systems', code: 'EEE302', department: 'Electrical', semester: 6, credits: 3, year: 3, faculty_id: 2 }
  ]);

  // 5. Insert Rooms (10 rooms)
  console.log('🏢 Seeding rooms...');
  await knex('rooms').insert([
    { id: 1, room_name: 'Room 101', building: 'Main Block', floor: 1, capacity: 60, is_available: true },
    { id: 2, room_name: 'Room 102', building: 'Main Block', floor: 1, capacity: 50, is_available: true },
    { id: 3, room_name: 'Room 201', building: 'Main Block', floor: 2, capacity: 40, is_available: true },
    { id: 4, room_name: 'Room 202', building: 'Main Block', floor: 2, capacity: 45, is_available: true },
    { id: 5, room_name: 'Lab 1', building: 'CS Block', floor: 1, capacity: 30, is_available: true },
    { id: 6, room_name: 'Lab 2', building: 'CS Block', floor: 1, capacity: 30, is_available: true },
    { id: 7, room_name: 'Room 301', building: 'ECE Block', floor: 3, capacity: 35, is_available: true },
    { id: 8, room_name: 'Seminar Hall', building: 'Main Block', floor: 0, capacity: 100, is_available: true },
    { id: 9, room_name: 'Auditorium', building: 'Main Block', floor: 0, capacity: 200, is_available: true },
    { id: 10, room_name: 'Conference Room', building: 'Admin Block', floor: 2, capacity: 25, is_available: true }
  ]);

  // 6. Insert Exams (4 exams with new structure)
  console.log('📝 Seeding exams...');
  await knex('exams').insert([
    { id: 1, exam_name: 'Mid-Semester Examination - March 2024', exam_type: 'mid-term', start_date: '2024-03-15', end_date: '2024-03-20', status: 'published', created_by: 18 },
    { id: 2, exam_name: 'End-Semester Examination - May 2024', exam_type: 'end-term', start_date: '2024-05-20', end_date: '2024-05-25', status: 'draft', created_by: 18 },
    { id: 3, exam_name: 'Supplementary Examination - June 2024', exam_type: 'supplementary', start_date: '2024-06-10', end_date: '2024-06-15', status: 'draft', created_by: 18 },
    { id: 4, exam_name: 'Regular Examination - April 2024', exam_type: 'regular', start_date: '2024-04-01', end_date: '2024-04-05', status: 'published', created_by: 18 }
  ]);

  // 7. Insert Exam Schedule (link exams to courses with dates/times)
  console.log('📅 Seeding exam schedule...');
  await knex('exam_schedule').insert([
    // Mid-Semester Exam - Multiple courses
    { exam_id: 1, course_id: 1, exam_date: '2024-03-15', start_time: '10:00:00', end_time: '12:00:00', duration_minutes: 120, total_marks: 50 },
    { exam_id: 1, course_id: 2, exam_date: '2024-03-16', start_time: '14:00:00', end_time: '16:00:00', duration_minutes: 120, total_marks: 50 },
    { exam_id: 1, course_id: 3, exam_date: '2024-03-17', start_time: '10:00:00', end_time: '12:00:00', duration_minutes: 120, total_marks: 50 },
    { exam_id: 1, course_id: 6, exam_date: '2024-03-18', start_time: '10:00:00', end_time: '12:00:00', duration_minutes: 120, total_marks: 50 },
    { exam_id: 1, course_id: 9, exam_date: '2024-03-19', start_time: '14:00:00', end_time: '16:00:00', duration_minutes: 120, total_marks: 50 },
    { exam_id: 1, course_id: 13, exam_date: '2024-03-20', start_time: '10:00:00', end_time: '12:00:00', duration_minutes: 120, total_marks: 50 },
    
    // End-Semester Exam
    { exam_id: 2, course_id: 1, exam_date: '2024-05-20', start_time: '10:00:00', end_time: '13:00:00', duration_minutes: 180, total_marks: 100 },
    { exam_id: 2, course_id: 2, exam_date: '2024-05-21', start_time: '10:00:00', end_time: '13:00:00', duration_minutes: 180, total_marks: 100 },
    
    // Regular Exam
    { exam_id: 4, course_id: 4, exam_date: '2024-04-01', start_time: '10:00:00', end_time: '12:00:00', duration_minutes: 120, total_marks: 50 },
    { exam_id: 4, course_id: 5, exam_date: '2024-04-02', start_time: '14:00:00', end_time: '16:00:00', duration_minutes: 120, total_marks: 50 }
  ]);

  // 8. Insert Student Academic Status
  console.log('📊 Seeding academic status...');
  await knex('student_academic_status').insert([
    { student_id: 1, year: 2024, semester: 4, credits_earned: 45, credits_required: 60, cgpa: 8.5, status: 'active' },
    { student_id: 2, year: 2024, semester: 4, credits_earned: 50, credits_required: 60, cgpa: 9.0, status: 'active' },
    { student_id: 3, year: 2024, semester: 5, credits_earned: 80, credits_required: 100, cgpa: 7.8, status: 'active' },
    { student_id: 4, year: 2024, semester: 5, credits_earned: 85, credits_required: 100, cgpa: 8.2, status: 'active' },
    { student_id: 5, year: 2024, semester: 3, credits_earned: 30, credits_required: 40, cgpa: 7.5, status: 'active' },
    { student_id: 6, year: 2024, semester: 3, credits_earned: 35, credits_required: 40, cgpa: 8.0, status: 'active' },
    { student_id: 7, year: 2024, semester: 6, credits_earned: 95, credits_required: 120, cgpa: 7.2, status: 'active' },
    { student_id: 8, year: 2024, semester: 2, credits_earned: 15, credits_required: 20, cgpa: 6.8, status: 'active' },
    { student_id: 9, year: 2024, semester: 2, credits_earned: 18, credits_required: 20, cgpa: 7.5, status: 'active' },
    { student_id: 10, year: 2024, semester: 7, credits_earned: 130, credits_required: 140, cgpa: 8.8, status: 'active' },
    { student_id: 11, year: 2024, semester: 7, credits_earned: 125, credits_required: 140, cgpa: 8.5, status: 'active' },
    { student_id: 12, year: 2024, semester: 4, credits_earned: 48, credits_required: 60, cgpa: 7.9, status: 'active' }
  ]);

  // 8. Insert Notifications
  console.log('🔔 Seeding notifications...');
  await knex('notifications').insert([
    { id: 1, title: 'Mid-Semester Exams Schedule', content: 'Mid-semester exams will be conducted from March 15-20, 2024. Please check your hall tickets.', type: 'announcement', priority: 'high', target_roles: JSON.stringify(['student']), is_published: true, created_by: 1 },
    { id: 2, title: 'Faculty Meeting', content: 'All faculty members are requested to attend the department meeting on March 10, 2024.', type: 'announcement', priority: 'medium', target_roles: JSON.stringify(['faculty']), is_published: true, created_by: 1 },
    { id: 3, title: 'Library Closure', content: 'The library will be closed for maintenance on March 5, 2024.', type: 'alert', priority: 'medium', target_roles: JSON.stringify(['student', 'faculty', 'admin']), is_published: true, created_by: 1 },
    { id: 4, title: 'Fee Payment Reminder', content: 'Last date for semester fee payment is March 31, 2024.', type: 'reminder', priority: 'high', target_roles: JSON.stringify(['student']), is_published: true, created_by: 1 }
  ]);

  // 9. Insert Course Enrollments
  console.log('📝 Seeding course enrollments...');
  await knex('course_enrollments').insert([
    // CS Students
    { student_id: 1, course_id: 1, enrolled_at: '2024-01-15' },
    { student_id: 1, course_id: 2, enrolled_at: '2024-01-15' },
    { student_id: 2, course_id: 1, enrolled_at: '2024-01-15' },
    { student_id: 2, course_id: 2, enrolled_at: '2024-01-15' },
    { student_id: 3, course_id: 3, enrolled_at: '2024-01-15' },
    { student_id: 3, course_id: 4, enrolled_at: '2024-01-15' },
    { student_id: 4, course_id: 3, enrolled_at: '2024-01-15' },
    { student_id: 4, course_id: 4, enrolled_at: '2024-01-15' },
    // ECE Students
    { student_id: 5, course_id: 6, enrolled_at: '2024-01-15' },
    { student_id: 6, course_id: 6, enrolled_at: '2024-01-15' },
    { student_id: 7, course_id: 8, enrolled_at: '2024-01-15' },
    // Mech Students
    { student_id: 8, course_id: 9, enrolled_at: '2024-01-15' },
    { student_id: 9, course_id: 9, enrolled_at: '2024-01-15' },
    // Civil Students
    { student_id: 10, course_id: 12, enrolled_at: '2024-01-15' },
    { student_id: 11, course_id: 12, enrolled_at: '2024-01-15' },
    // EEE Students
    { student_id: 12, course_id: 13, enrolled_at: '2024-01-15' }
  ]);

  // 10. Insert Fee Payments
  console.log('💰 Seeding fee payments...');
  await knex('fee_payments').insert([
    { student_id: 1, amount: 50000, payment_type: 'tuition', status: 'approved', transaction_id: 'TXN001', approved_by: 1, payment_date: '2024-01-10', approved_at: '2024-01-11 10:00:00' },
    { student_id: 2, amount: 50000, payment_type: 'tuition', status: 'approved', transaction_id: 'TXN002', approved_by: 1, payment_date: '2024-01-11', approved_at: '2024-01-12 10:00:00' },
    { student_id: 3, amount: 50000, payment_type: 'tuition', status: 'approved', transaction_id: 'TXN003', approved_by: 1, payment_date: '2024-01-12', approved_at: '2024-01-13 10:00:00' },
    { student_id: 4, amount: 50000, payment_type: 'tuition', status: 'pending', transaction_id: 'TXN004', payment_date: '2024-01-13' },
    { student_id: 5, amount: 50000, payment_type: 'tuition', status: 'pending', transaction_id: 'TXN005', payment_date: '2024-01-14' },
    { student_id: 6, amount: 50000, payment_type: 'exam', status: 'approved', transaction_id: 'TXN006', approved_by: 1, payment_date: '2024-01-15', approved_at: '2024-01-16 10:00:00' },
    { student_id: 7, amount: 50000, payment_type: 'tuition', status: 'approved', transaction_id: 'TXN007', approved_by: 1, payment_date: '2024-01-16', approved_at: '2024-01-17 10:00:00' },
    { student_id: 8, amount: 50000, payment_type: 'tuition', status: 'approved', transaction_id: 'TXN008', approved_by: 1, payment_date: '2024-01-17', approved_at: '2024-01-18 10:00:00' },
    { student_id: 9, amount: 50000, payment_type: 'tuition', status: 'pending', transaction_id: 'TXN009', payment_date: '2024-01-18' },
    { student_id: 10, amount: 50000, payment_type: 'hostel', status: 'approved', transaction_id: 'TXN010', approved_by: 1, payment_date: '2024-01-19', approved_at: '2024-01-20 10:00:00' },
    { student_id: 11, amount: 50000, payment_type: 'tuition', status: 'approved', transaction_id: 'TXN011', approved_by: 1, payment_date: '2024-01-20', approved_at: '2024-01-21 10:00:00' },
    { student_id: 12, amount: 50000, payment_type: 'tuition', status: 'approved', transaction_id: 'TXN012', approved_by: 1, payment_date: '2024-01-21', approved_at: '2024-01-22 10:00:00' }
  ]);

  // 11. Insert Hall Tickets
  console.log('🎫 Seeding hall tickets...');
  await knex('hall_tickets').insert([
    { student_id: 1, exam_id: 1, ticket_number: 'HT2024001', qr_code: 'QR001', status: 'approved', approved_by: 1, approved_at: '2024-03-10 10:00:00' },
    { student_id: 1, exam_id: 2, ticket_number: 'HT2024002', qr_code: 'QR002', status: 'approved', approved_by: 1, approved_at: '2024-03-10 10:00:00' },
    { student_id: 2, exam_id: 1, ticket_number: 'HT2024003', qr_code: 'QR003', status: 'approved', approved_by: 1, approved_at: '2024-03-10 10:00:00' },
    { student_id: 2, exam_id: 2, ticket_number: 'HT2024004', qr_code: 'QR004', status: 'pending', approved_by: null, approved_at: null },
    { student_id: 3, exam_id: 3, ticket_number: 'HT2024005', qr_code: 'QR005', status: 'approved', approved_by: 1, approved_at: '2024-03-10 10:00:00' },
    { student_id: 4, exam_id: 3, ticket_number: 'HT2024006', qr_code: 'QR006', status: 'pending', approved_by: null, approved_at: null },
    { student_id: 5, exam_id: 4, ticket_number: 'HT2024007', qr_code: 'QR007', status: 'approved', approved_by: 1, approved_at: '2024-03-10 10:00:00' },
    { student_id: 6, exam_id: 4, ticket_number: 'HT2024008', qr_code: 'QR008', status: 'approved', approved_by: 1, approved_at: '2024-03-10 10:00:00' }
  ]);

  // 12. Insert Seating Allocations
  console.log('💺 Seeding seating allocations...');
  await knex('seating_allocations').insert([
    { exam_id: 1, student_id: 1, room_id: 1, seat_number: 'A-01', allocated_by: 18 },
    { exam_id: 1, student_id: 2, room_id: 1, seat_number: 'A-05', allocated_by: 18 },
    { exam_id: 2, student_id: 1, room_id: 2, seat_number: 'B-03', allocated_by: 18 },
    { exam_id: 3, student_id: 3, room_id: 3, seat_number: 'C-02', allocated_by: 18 },
    { exam_id: 3, student_id: 4, room_id: 3, seat_number: 'C-08', allocated_by: 18 },
    { exam_id: 4, student_id: 5, room_id: 4, seat_number: 'D-01', allocated_by: 18 },
    { exam_id: 4, student_id: 6, room_id: 4, seat_number: 'D-06', allocated_by: 18 }
  ]);

  // 13. Insert Clubs
  console.log('🎭 Seeding clubs...');
  await knex('clubs').insert([
    { id: 1, name: 'Tech Club', description: 'Technology and Innovation Club', category: 'technical', coordinator_id: 17, is_active: true, created_at: '2024-01-01 10:00:00' },
    { id: 2, name: 'Cultural Club', description: 'Arts and Cultural Activities', category: 'cultural', coordinator_id: 17, is_active: true, created_at: '2024-01-01 10:00:00' },
    { id: 3, name: 'Sports Club', description: 'Sports and Fitness Activities', category: 'sports', coordinator_id: 17, is_active: true, created_at: '2024-01-01 10:00:00' }
  ]);

  // 14. Insert Club Members
  console.log('👥 Seeding club members...');
  await knex('club_members').insert([
    { club_id: 1, student_id: 1, role: 'president', joined_date: '2024-01-05' },
    { club_id: 1, student_id: 2, role: 'member', joined_date: '2024-01-06' },
    { club_id: 1, student_id: 3, role: 'member', joined_date: '2024-01-07' },
    { club_id: 2, student_id: 4, role: 'president', joined_date: '2024-01-05' },
    { club_id: 2, student_id: 5, role: 'member', joined_date: '2024-01-08' },
    { club_id: 3, student_id: 6, role: 'president', joined_date: '2024-01-05' },
    { club_id: 3, student_id: 7, role: 'member', joined_date: '2024-01-09' }
  ]);

  // 15. Insert Events (using existing events table structure for general events)
  console.log('📅 Seeding events...');
  await knex('events').insert([
    { title: 'Hackathon 2024', description: 'Annual coding competition', event_date: '2024-04-15', start_time: '09:00:00', end_time: '18:00:00', location: 'Computer Lab', expected_attendance: 50, status: 'approved', submitted_by: 17, reviewed_by: 1, reviewed_at: '2024-01-15 10:00:00' },
    { title: 'Tech Talk Series', description: 'Guest lecture on AI/ML', event_date: '2024-03-20', start_time: '14:00:00', end_time: '16:00:00', location: 'Auditorium', expected_attendance: 100, status: 'approved', submitted_by: 17, reviewed_by: 1, reviewed_at: '2024-01-15 10:00:00' },
    { title: 'Cultural Fest', description: 'Annual cultural festival', event_date: '2024-05-10', start_time: '10:00:00', end_time: '20:00:00', location: 'Main Ground', expected_attendance: 200, status: 'pending', submitted_by: 17 },
    { title: 'Sports Day', description: 'Inter-department sports competition', event_date: '2024-04-25', start_time: '08:00:00', end_time: '17:00:00', location: 'Sports Complex', expected_attendance: 150, status: 'approved', submitted_by: 17, reviewed_by: 1, reviewed_at: '2024-01-15 10:00:00' }
  ]);

  console.log('\n✅ Comprehensive seed completed!\n');
  console.log('📊 Summary:');
  console.log('   - 19 Users (1 Admin, 12 Students, 4 Faculty, 2 Staff)');
  console.log('   - 12 Students across 5 departments');
  console.log('   - 4 Faculty members');
  console.log('   - 15 Courses');
  console.log('   - 10 Rooms');
  console.log('   - 8 Exams');
  console.log('   - 12 Academic Status records');
  console.log('   - 4 Notifications');
  console.log('   - 16 Course Enrollments');
  console.log('   - 12 Payment records');
  console.log('   - 8 Hall Tickets');
  console.log('   - 7 Seating Allocations');
  console.log('   - 3 Clubs');
  console.log('   - 7 Club Members');
  console.log('   - 4 Events');
  console.log('\n🔐 Test Credentials (password: password123):');
  console.log('   Admin: admin@university.edu');
  console.log('   Students: student1@university.edu to student12@university.edu');
  console.log('   Faculty: faculty1@university.edu to faculty4@university.edu');
  console.log('   Club Coordinator: club@university.edu or faculty4@university.edu');
};
