const examService = require('../services/exam.service');

class ExamController {
  /**
   * Create new exam
   */
  async createExam(req, res, next) {
    try {
      console.log('Create exam request body:', JSON.stringify(req.body, null, 2));
      const createdBy = req.user.id;
      const examId = await examService.createExam({
        ...req.body,
        createdBy
      });
      
      res.json({ 
        success: true, 
        data: { id: examId },
        message: 'Exam created successfully'
      });
    } catch (error) {
      console.error('Create exam error:', error);
      next(error);
    }
  }

  /**
   * Get all exams
   */
  async getAllExams(req, res, next) {
    try {
      const exams = await examService.getAllExams(req.query);
      res.json({ success: true, data: exams });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get exam by ID
   */
  async getExamById(req, res, next) {
    try {
      const { examId } = req.params;
      const exam = await examService.getExamById(examId);
      res.json({ success: true, data: exam });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update exam
   */
  async updateExam(req, res, next) {
    try {
      const { examId } = req.params;
      await examService.updateExam(examId, req.body);
      res.json({ 
        success: true,
        message: 'Exam updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete exam
   */
  async deleteExam(req, res, next) {
    try {
      const { examId } = req.params;
      await examService.deleteExam(examId);
      res.json({ 
        success: true,
        message: 'Exam deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publish exam
   */
  async publishExam(req, res, next) {
    try {
      const { examId } = req.params;
      const publishedBy = req.user.id;
      await examService.publishExam(examId, publishedBy);
      res.json({ 
        success: true,
        message: 'Exam published successfully. Students can now view the exam schedule.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add subject to exam
   */
  async addSubject(req, res, next) {
    try {
      const { examId } = req.params;
      const scheduleId = await examService.addSubjectToExam(examId, req.body);
      res.json({ 
        success: true, 
        data: { id: scheduleId },
        message: 'Subject added to exam'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove subject from exam
   */
  async removeSubject(req, res, next) {
    try {
      const { scheduleId } = req.params;
      await examService.removeSubjectFromExam(scheduleId);
      res.json({ 
        success: true,
        message: 'Subject removed from exam'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student exams
   */
  async getStudentExams(req, res, next) {
    try {
      const studentId = req.user.studentId;
      const exams = await examService.getStudentExams(studentId);
      res.json({ success: true, data: exams });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get exam timetable for student
   */
  async getExamTimetable(req, res, next) {
    try {
      const { examId } = req.params;
      const studentId = req.user.studentId;
      const timetable = await examService.getExamTimetable(examId, studentId);
      res.json({ success: true, data: timetable });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get published exams (for dropdown)
   */
  async getPublishedExams(req, res, next) {
    try {
      const exams = await examService.getPublishedExams();
      res.json({ success: true, data: exams });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExamController();
