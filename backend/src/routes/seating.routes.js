const express = require('express');
const router = express.Router();
const seatingController = require('../controllers/seating.controller');
const examController = require('../controllers/exam.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication and seating manager role
router.use(authenticate);
router.use(authorize(['seating_manager', 'admin']));

// Courses (for exam management)
router.get('/courses', async (req, res, next) => {
  try {
    const adminService = require('../services/admin.service');
    const courses = await adminService.getCourses();
    
    // Prevent caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    next(error);
  }
});

// Exam Management
router.post('/exams', examController.createExam);
router.get('/exams', examController.getAllExams);
router.get('/exams/published', examController.getPublishedExams);
router.get('/exams/:examId', examController.getExamById);
router.put('/exams/:examId', examController.updateExam);
router.delete('/exams/:examId', examController.deleteExam);
router.post('/exams/:examId/publish', examController.publishExam);
router.post('/exams/:examId/subjects', examController.addSubject);
router.delete('/exams/subjects/:scheduleId', examController.removeSubject);

// Seat Allocation
router.post('/allocate', seatingController.allocateSeats);
router.get('/chart/:examId', seatingController.getSeatingChart);
router.get('/statistics/:examId', seatingController.getSeatingStatistics);
router.get('/export/:examId', seatingController.exportSeatingChart);
router.delete('/allocations/:examId', seatingController.clearAllocations);

// Hall Tickets
router.post('/hall-tickets/generate', seatingController.generateHallTickets);
router.get('/hall-tickets/:examId', seatingController.getHallTickets);
router.get('/hall-tickets/:examId/statistics', seatingController.getHallTicketStatistics);
router.post('/hall-tickets/approve', seatingController.approveHallTickets);

// Blueprints
router.post('/blueprints', seatingController.uploadBlueprint);
router.get('/blueprints/:blueprintId/analyze', seatingController.analyzeBlueprint);

// Configuration
router.get('/configuration/:examId', seatingController.getConfiguration);
router.post('/configuration', seatingController.saveConfiguration);

// Room Availability
router.get('/rooms/availability', seatingController.getRoomAvailability);

// Student Seat
router.get('/student/:studentId/exam/:examId', seatingController.getStudentSeat);

module.exports = router;
