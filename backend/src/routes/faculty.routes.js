const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/faculty.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/course_materials/' });

// All routes require authentication and faculty role
router.use(authenticate);
router.use(authorize(['faculty']));

// Dashboard
router.get('/dashboard', facultyController.getDashboard);

// Courses
router.get('/courses', facultyController.getCourses);

// Course Materials
router.post('/materials', upload.single('file'), facultyController.uploadMaterial);

// Assignments
router.post('/assignments', facultyController.createAssignment);
router.get('/assignments/:assignmentId/submissions', facultyController.getSubmissions);
router.put('/submissions/:submissionId/grade', facultyController.gradeAssignment);

// Attendance
router.post('/attendance', facultyController.markAttendance);
router.get('/courses/:courseId/attendance', facultyController.getCourseAttendance);

// Performance
router.post('/performance', facultyController.recordPerformance);
router.get('/courses/:courseId/performance', facultyController.getStudentPerformance);

// Feedback
router.get('/feedback', facultyController.getFeedback);

// Timetable
router.get('/timetable', facultyController.getTimetable);

// Course Materials
router.get('/courses/:courseId/materials', facultyController.getCourseMaterials);
router.delete('/materials/:materialId', facultyController.deleteMaterial);

// Assignments
router.get('/courses/:courseId/assignments', facultyController.getAssignments);
router.delete('/assignments/:assignmentId', facultyController.deleteAssignment);

module.exports = router;
