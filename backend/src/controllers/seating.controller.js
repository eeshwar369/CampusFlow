const seatingService = require('../services/seating.service');

class SeatingController {
  async allocateSeats(req, res, next) {
    try {
      const { examId, excludeDetained, spacing } = req.body;
      const result = await seatingService.allocateSeats(examId, {
        excludeDetained,
        spacing
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getSeatingChart(req, res, next) {
    try {
      const { examId } = req.params;
      const chart = await seatingService.getSeatingChart(examId);
      res.json({ success: true, data: chart });
    } catch (error) {
      next(error);
    }
  }

  async uploadBlueprint(req, res, next) {
    try {
      const { roomId, examId, blueprintData } = req.body;
      const uploadedBy = req.user.id;
      
      const blueprintId = await seatingService.uploadBlueprint({
        roomId, examId, blueprintData, uploadedBy
      });
      
      res.json({ success: true, data: { id: blueprintId } });
    } catch (error) {
      next(error);
    }
  }

  async analyzeBlueprint(req, res, next) {
    try {
      const { blueprintId } = req.params;
      const analysis = await seatingService.analyzeBlueprint(blueprintId);
      res.json({ success: true, data: analysis });
    } catch (error) {
      next(error);
    }
  }

  async getConfiguration(req, res, next) {
    try {
      const { examId } = req.params;
      const config = await seatingService.getConfiguration(examId);
      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  }

  async saveConfiguration(req, res, next) {
    try {
      const configId = await seatingService.saveConfiguration(req.body);
      res.json({ success: true, data: { id: configId } });
    } catch (error) {
      next(error);
    }
  }

  async getRoomAvailability(req, res, next) {
    try {
      const { date, startTime, endTime } = req.query;
      const rooms = await seatingService.getRoomAvailability(date, startTime, endTime);
      res.json({ success: true, data: rooms });
    } catch (error) {
      next(error);
    }
  }

  async clearAllocations(req, res, next) {
    try {
      const { examId } = req.params;
      const count = await seatingService.clearAllocations(examId);
      res.json({ success: true, data: { cleared: count } });
    } catch (error) {
      next(error);
    }
  }

  async getStudentSeat(req, res, next) {
    try {
      const { studentId, examId } = req.params;
      const seat = await seatingService.getStudentSeat(studentId, examId);
      res.json({ success: true, data: seat });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SeatingController();
