const studentService = require('../services/student.service');
const notificationService = require('../services/notification.service');

class StudentController {
  async getDashboard(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const dashboard = await studentService.getDashboard(studentId);
      res.json({ success: true, data: dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getCourses(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const courses = await studentService.getCourses(studentId);
      res.json({ success: true, data: courses });
    } catch (error) {
      next(error);
    }
  }

  async getCourseMaterials(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const { courseId } = req.params;
      const materials = await studentService.getCourseMaterials(studentId, courseId);
      res.json({ success: true, data: materials });
    } catch (error) {
      next(error);
    }
  }

  async getPerformance(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const performance = await studentService.getPerformance(studentId);
      res.json({ success: true, data: performance });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendations(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const recommendations = await studentService.getRecommendations(studentId);
      res.json({ success: true, data: recommendations });
    } catch (error) {
      next(error);
    }
  }

  async submitFeedback(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const feedbackId = await studentService.submitFeedback(studentId, req.body);
      res.json({ success: true, data: { id: feedbackId } });
    } catch (error) {
      next(error);
    }
  }

  async getHallTickets(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const tickets = await studentService.getHallTickets(studentId);
      res.json({ success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  }

  async downloadHallTicket(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const { ticketId } = req.params;
      const path = require('path');
      const fs = require('fs');
      
      // Verify ticket belongs to student
      const [tickets] = await require('../config/database').query(`
        SELECT file_path, ticket_number 
        FROM hall_tickets 
        WHERE id = ? AND student_id = ? AND status = 'approved'
      `, [ticketId, studentId]);

      if (tickets.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Hall ticket not found or not approved' 
        });
      }

      const filePath = tickets[0].file_path;
      const ticketNumber = tickets[0].ticket_number;

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
          success: false, 
          message: 'Hall ticket file not found' 
        });
      }

      // Send file
      res.download(filePath, `HallTicket_${ticketNumber}.pdf`, (err) => {
        if (err) {
          next(err);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendance(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const { courseId } = req.query;
      const attendance = await studentService.getAttendance(studentId, courseId);
      res.json({ success: true, data: attendance });
    } catch (error) {
      next(error);
    }
  }

  async getAssignments(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const assignments = await studentService.getAssignments(studentId);
      res.json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  async submitAssignment(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const { assignmentId, comments } = req.body;
      const filePath = req.file ? req.file.path : null;
      
      const submissionId = await studentService.submitAssignment(
        studentId, assignmentId, filePath, comments
      );
      res.json({ success: true, data: { id: submissionId } });
    } catch (error) {
      next(error);
    }
  }

  async getMindMaps(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const mindMaps = await studentService.getMindMaps(studentId);
      res.json({ success: true, data: mindMaps });
    } catch (error) {
      next(error);
    }
  }

  async getClubMemberships(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const memberships = await studentService.getClubMemberships(studentId);
      res.json({ success: true, data: memberships });
    } catch (error) {
      next(error);
    }
  }

  async getEvents(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const events = await studentService.getApprovedEvents(studentId);
      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }

  async participateInEvent(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const { eventId } = req.params;
      const participationId = await studentService.participateInEvent(studentId, eventId);
      res.json({ success: true, data: { id: participationId } });
    } catch (error) {
      next(error);
    }
  }

  async registerForEvent(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const { eventId } = req.body;
      const participantId = await studentService.registerForEvent(studentId, eventId);
      res.json({ success: true, data: { id: participantId } });
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const { unreadOnly } = req.query;
      const notifications = await notificationService.getUserNotifications(
        userId, unreadOnly === 'true'
      );
      res.json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async markNotificationRead(req, res, next) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;
      await notificationService.markAsRead(notificationId, userId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
