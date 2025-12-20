const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const examController = require('../controllers/exam.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/assignments/' });

// All routes require authentication and student role
router.use(authenticate);
router.use(authorize(['student']));

// Dashboard
router.get('/dashboard', studentController.getDashboard);

// Courses
router.get('/courses', studentController.getCourses);
router.get('/courses/:courseId/materials', studentController.getCourseMaterials);

// Exams
router.get('/exams', examController.getStudentExams);
router.get('/exams/:examId/timetable', examController.getExamTimetable);

// Performance
router.get('/performance', studentController.getPerformance);
router.get('/recommendations', studentController.getRecommendations);

// Feedback
router.post('/feedback', studentController.submitFeedback);

// Hall Tickets
router.get('/hall-tickets', studentController.getHallTickets);
router.get('/hall-tickets/:ticketId/download', studentController.downloadHallTicket);

// Attendance
router.get('/attendance', studentController.getAttendance);

// Assignments
router.get('/assignments', studentController.getAssignments);
router.post('/assignments/submit', upload.single('file'), studentController.submitAssignment);

// Mind Maps
router.get('/mind-maps', studentController.getMindMaps);

// Clubs
router.get('/clubs/memberships', studentController.getClubMemberships);

// Events
router.get('/events', studentController.getEvents);
router.post('/events/:eventId/participate', studentController.participateInEvent);
router.post('/events/register', studentController.registerForEvent);

// Notifications
router.get('/notifications', studentController.getNotifications);
router.put('/notifications/:notificationId/read', studentController.markNotificationRead);

module.exports = router;
