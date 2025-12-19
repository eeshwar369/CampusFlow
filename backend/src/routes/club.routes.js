const express = require('express');
const router = express.Router();
const clubController = require('../controllers/club.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/event_documents/' });

// All routes require authentication
router.use(authenticate);

// Public club routes (all authenticated users)
router.get('/', clubController.getAllClubs);
router.get('/:clubId/dashboard', clubController.getDashboard);
router.get('/:clubId/events', clubController.getEvents);
router.get('/:clubId/achievements', clubController.getAchievements);

// Club coordinator routes
router.use(authorize(['club_coordinator', 'admin']));

// Members
router.get('/:clubId/members', clubController.getMembers);
router.post('/:clubId/members', clubController.addMember);
router.delete('/:clubId/members/:studentId', clubController.removeMember);
router.put('/:clubId/members/:studentId/role', clubController.updateMemberRole);

// Events
router.post('/:clubId/events', clubController.createEvent);
router.put('/events/:eventId', clubController.updateEvent);
router.delete('/events/:eventId', clubController.cancelEvent);
router.get('/events/:eventId/participants', clubController.getEventParticipants);
router.put('/events/:eventId/participants/:studentId/approve', clubController.approveParticipant);
router.get('/events/:eventId/change-log', clubController.getEventChangeLog);
router.post('/events/:eventId/documents', upload.single('file'), clubController.uploadEventDocument);

// Achievements
router.post('/:clubId/achievements', clubController.recordAchievement);

// Participation management
router.get('/participations/pending', clubController.getPendingParticipations);
router.put('/participations/:participationId/approve', clubController.approveParticipation);
router.put('/participations/:participationId/reject', clubController.rejectParticipation);

module.exports = router;
