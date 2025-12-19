const express = require('express');
const router = express.Router();
const seatingController = require('../controllers/seating.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication and seating manager role
router.use(authenticate);
router.use(authorize(['seating_manager', 'admin']));

// Seat Allocation
router.post('/allocate', seatingController.allocateSeats);
router.get('/chart/:examId', seatingController.getSeatingChart);
router.delete('/allocations/:examId', seatingController.clearAllocations);

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
