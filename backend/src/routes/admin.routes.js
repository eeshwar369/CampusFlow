const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Configure multer for file uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Students
router.get('/students', adminController.getStudents);
router.get('/students/export', adminController.exportStudents);
router.post('/students/import', upload.single('file'), adminController.importStudents);
router.put('/students/:studentId/academic-status', adminController.updateAcademicStatus);
router.post('/students/:studentId/reevaluate', adminController.reevaluateStudentEligibility);

// Courses
router.get('/courses', adminController.getCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:courseId', adminController.updateCourse);

// Fee Payments
router.get('/payments/pending', adminController.getPendingPayments);
router.put('/payments/:paymentId/approve', adminController.approveFeePayment);
router.put('/payments/:paymentId/reject', adminController.rejectFeePayment);

// Hall Tickets
router.get('/hall-tickets/pending', adminController.getPendingHallTickets);
router.put('/hall-tickets/:ticketId/approve', adminController.approveHallTicket);
router.post('/hall-tickets/bulk-upload', adminController.bulkUploadHallTickets);
router.get('/bulk-uploads/:uploadId', adminController.getBulkUploadStatus);

// Notifications
router.post('/notifications', adminController.createNotification);
router.put('/notifications/:notificationId/publish', adminController.publishNotification);
router.get('/notifications', adminController.getAllNotifications);

// Reports
router.get('/reports/:reportType', adminController.generateReport);

// Timetable
router.post('/timetable', adminController.createTimetableEntry);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

// Exams
router.get('/exams', adminController.getExams);

// Rooms
router.get('/rooms', adminController.getRooms);

module.exports = router;
