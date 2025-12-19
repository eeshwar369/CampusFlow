const clubService = require('../services/club.service');

class ClubController {
  async getDashboard(req, res, next) {
    try {
      const { clubId } = req.params;
      const dashboard = await clubService.getDashboard(clubId);
      res.json({ success: true, data: dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getAllClubs(req, res, next) {
    try {
      const clubs = await clubService.getAllClubs();
      res.json({ success: true, data: clubs });
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req, res, next) {
    try {
      const { clubId } = req.params;
      const members = await clubService.getMembers(clubId);
      res.json({ success: true, data: members });
    } catch (error) {
      next(error);
    }
  }

  async addMember(req, res, next) {
    try {
      const { clubId } = req.params;
      const { studentId, role } = req.body;
      const memberId = await clubService.addMember(clubId, studentId, role);
      res.json({ success: true, data: { id: memberId } });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      const { clubId, studentId } = req.params;
      await clubService.removeMember(clubId, studentId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req, res, next) {
    try {
      const { clubId, studentId } = req.params;
      const { role } = req.body;
      await clubService.updateMemberRole(clubId, studentId, role);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req, res, next) {
    try {
      const { clubId } = req.params;
      const createdBy = req.user.id;
      const eventId = await clubService.createEvent(clubId, {
        ...req.body,
        createdBy
      });
      res.json({ success: true, data: { id: eventId } });
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const updatedBy = req.user.id;
      const result = await clubService.updateEvent(eventId, req.body, updatedBy);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async cancelEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const { reason } = req.body;
      const cancelledBy = req.user.id;
      await clubService.cancelEvent(eventId, cancelledBy, reason);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async getEvents(req, res, next) {
    try {
      const { clubId } = req.params;
      const { includeHistory } = req.query;
      const events = await clubService.getEvents(clubId, includeHistory === 'true');
      res.json({ success: true, data: events });
    } catch (error) {
      next(error);
    }
  }

  async getEventParticipants(req, res, next) {
    try {
      const { eventId } = req.params;
      const participants = await clubService.getEventParticipants(eventId);
      res.json({ success: true, data: participants });
    } catch (error) {
      next(error);
    }
  }

  async approveParticipant(req, res, next) {
    try {
      const { eventId, studentId } = req.params;
      await clubService.approveParticipant(eventId, studentId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async recordAchievement(req, res, next) {
    try {
      const { clubId } = req.params;
      const recordedBy = req.user.id;
      const achievementId = await clubService.recordAchievement(clubId, {
        ...req.body,
        recordedBy
      });
      res.json({ success: true, data: { id: achievementId } });
    } catch (error) {
      next(error);
    }
  }

  async getAchievements(req, res, next) {
    try {
      const { clubId } = req.params;
      const achievements = await clubService.getAchievements(clubId);
      res.json({ success: true, data: achievements });
    } catch (error) {
      next(error);
    }
  }

  async getEventChangeLog(req, res, next) {
    try {
      const { eventId } = req.params;
      const logs = await clubService.getEventChangeLog(eventId);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  async uploadEventDocument(req, res, next) {
    try {
      const { eventId } = req.params;
      const { documentType } = req.body;
      const filePath = req.file ? req.file.path : null;
      const uploadedBy = req.user.id;

      const documentId = await clubService.uploadEventDocument(eventId, {
        documentType, filePath, uploadedBy
      });

      res.json({ success: true, data: { id: documentId } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClubController();
