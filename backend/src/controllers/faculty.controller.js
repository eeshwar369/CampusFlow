const facultyService = require('../services/faculty.service');

class FacultyController {
  async getDashboard(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const dashboard = await facultyService.getDashboard(facultyId);
      res.json({ success: true, data: dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getCourses(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const courses = await facultyService.getCourses(facultyId);
      res.json({ success: true, data: courses });
    } catch (error) {
      next(error);
    }
  }

  async uploadMaterial(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const { courseId, title, description, fileType } = req.body;
      const filePath = req.file ? req.file.path : null;
      const fileSize = req.file ? req.file.size : 0;

      const materialId = await facultyService.uploadMaterial(facultyId, {
        courseId, title, description, fileType, filePath, fileSize
      });

      res.json({ success: true, data: { id: materialId } });
    } catch (error) {
      next(error);
    }
  }

  async createAssignment(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const assignmentId = await facultyService.createAssignment(facultyId, req.body);
      res.json({ success: true, data: { id: assignmentId } });
    } catch (error) {
      next(error);
    }
  }

  async getSubmissions(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const { assignmentId } = req.params;
      const submissions = await facultyService.getSubmissions(facultyId, assignmentId);
      res.json({ success: true, data: submissions });
    } catch (error) {
      next(error);
    }
  }

  async gradeAssignment(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const { submissionId } = req.params;
      const { marksObtained, feedback } = req.body;
      
      await facultyService.gradeAssignment(facultyId, submissionId, marksObtained, feedback);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async markAttendance(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const count = await facultyService.markAttendance(facultyId, req.body);
      res.json({ success: true, data: { recordsCreated: count } });
    } catch (error) {
      next(error);
    }
  }

  async getCourseAttendance(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const { courseId } = req.params;
      const attendance = await facultyService.getCourseAttendance(facultyId, courseId);
      res.json({ success: true, data: attendance });
    } catch (error) {
      next(error);
    }
  }

  async recordPerformance(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const performanceId = await facultyService.recordPerformance(facultyId, req.body);
      res.json({ success: true, data: { id: performanceId } });
    } catch (error) {
      next(error);
    }
  }

  async getStudentPerformance(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const { courseId } = req.params;
      const { studentId } = req.query;
      const performance = await facultyService.getStudentPerformance(
        facultyId, courseId, studentId
      );
      res.json({ success: true, data: performance });
    } catch (error) {
      next(error);
    }
  }

  async getFeedback(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const { courseId } = req.query;
      const feedback = await facultyService.getFeedback(facultyId, courseId);
      res.json({ success: true, data: feedback });
    } catch (error) {
      next(error);
    }
  }

  async getTimetable(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const timetable = await facultyService.getTimetable(facultyId);
      res.json({ success: true, data: timetable });
    } catch (error) {
      next(error);
    }
  }

  async getCourseMaterials(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const { courseId } = req.params;
      const materials = await facultyService.getCourseMaterials(facultyId, courseId);
      res.json({ success: true, data: materials });
    } catch (error) {
      next(error);
    }
  }

  async getAssignments(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const { courseId } = req.params;
      const assignments = await facultyService.getAssignments(facultyId, courseId);
      res.json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  async deleteAssignment(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const { assignmentId } = req.params;
      await facultyService.deleteAssignment(facultyId, assignmentId);
      res.json({ success: true, message: 'Assignment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteMaterial(req, res, next) {
    try {
      const facultyId = req.user.facultyId;
      const { materialId } = req.params;
      await facultyService.deleteMaterial(facultyId, materialId);
      res.json({ success: true, message: 'Material deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FacultyController();
