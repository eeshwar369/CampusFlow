const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Configure multer for Excel uploads
const excelUpload = multer({ 
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

// Configure multer for hall ticket PDF uploads (disk storage)
const path = require('path');
const hallTicketStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/hall_tickets');
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Extract roll number from filename (e.g., CS2021001.pdf)
    const originalName = file.originalname;
    const rollNumber = path.parse(originalName).name;
    cb(null, `${rollNumber}_${Date.now()}.pdf`);
  }
});

const hallTicketUpload = multer({
  storage: hallTicketStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
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
router.post('/students/import', excelUpload.single('file'), adminController.importStudents);
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
router.post('/hall-tickets/bulk-upload', hallTicketUpload.array('hallTickets', 100), adminController.bulkUploadHallTickets);
router.get('/bulk-uploads/:uploadId', adminController.getBulkUploadStatus);
router.get('/hall-tickets/exams', adminController.getExamsForHallTickets);
router.get('/hall-tickets/departments', adminController.getDepartments);

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

// Events
router.get('/events/pending', adminController.getPendingEvents);
router.put('/events/:eventId/approve', adminController.approveEvent);
router.put('/events/:eventId/reject', adminController.rejectEvent);

module.exports = router;
