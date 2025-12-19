const db = require('../config/database');

class ExamService {
  /**
   * Create a new exam with subjects
   */
  async createExam(data) {
    console.log('ExamService.createExam called with data:', JSON.stringify(data, null, 2));
    
    const {
      examName,
      examType,
      startDate,
      endDate,
      subjects,
      createdBy
    } = data;

    console.log('Extracted fields:', { examName, examType, startDate, endDate, subjectsCount: subjects?.length, createdBy });

    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Insert exam
      console.log('Inserting exam...');
      const [examResult] = await connection.query(`
        INSERT INTO exams 
        (exam_name, exam_type, start_date, end_date, status, created_by, created_at)
        VALUES (?, ?, ?, ?, 'draft', ?, NOW())
      `, [examName, examType, startDate, endDate, createdBy]);

      const examId = examResult.insertId;
      console.log('Exam inserted with ID:', examId);

      // Insert exam subjects (schedule)
      if (subjects && subjects.length > 0) {
        console.log('Inserting subjects:', subjects);
        const subjectValues = subjects.map(subject => [
          examId,
          subject.courseId,
          subject.examDate,
          subject.startTime,
          subject.endTime,
          subject.durationMinutes,
          subject.totalMarks
        ]);

        await connection.query(`
          INSERT INTO exam_schedule
          (exam_id, course_id, exam_date, start_time, end_time, duration_minutes, total_marks)
          VALUES ?
        `, [subjectValues]);
        console.log('Subjects inserted successfully');
      }

      await connection.commit();
      console.log('Transaction committed successfully');
      return examId;
    } catch (error) {
      console.error('Error in createExam:', error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all exams with schedule
   */
  async getAllExams(filters = {}) {
    const { status, examType } = filters;
    
    let query = `
      SELECT e.*, 
             COUNT(DISTINCT es.id) as subject_count,
             COUNT(DISTINCT sa.id) as allocated_count,
             u.first_name as created_by_name
      FROM exams e
      LEFT JOIN exam_schedule es ON e.id = es.exam_id
      LEFT JOIN seating_allocations sa ON e.id = sa.exam_id
      LEFT JOIN users u ON e.created_by = u.id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    if (examType) {
      query += ' AND e.exam_type = ?';
      params.push(examType);
    }

    query += ' GROUP BY e.id ORDER BY e.start_date DESC';

    const [exams] = await db.query(query, params);
    return exams;
  }

  /**
   * Get exam by ID with full schedule
   */
  async getExamById(examId) {
    const [exams] = await db.query(`
      SELECT e.*, u.first_name as created_by_name
      FROM exams e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [examId]);

    if (exams.length === 0) {
      throw new Error('Exam not found');
    }

    const exam = exams[0];

    // Get schedule
    const [schedule] = await db.query(`
      SELECT es.*, c.name as course_name, c.code as course_code, c.department
      FROM exam_schedule es
      JOIN courses c ON es.course_id = c.id
      WHERE es.exam_id = ?
      ORDER BY es.exam_date, es.start_time
    `, [examId]);

    exam.schedule = schedule;

    return exam;
  }

  /**
   * Publish exam (make it visible to students)
   */
  async publishExam(examId, publishedBy) {
    console.log('Publishing exam:', examId, 'by user:', publishedBy);
    
    const [result] = await db.query(`
      UPDATE exams 
      SET status = 'published', published_by = ?, published_at = NOW()
      WHERE id = ? AND status = 'draft'
    `, [publishedBy, examId]);

    if (result.affectedRows === 0) {
      throw new Error('Exam not found or already published');
    }

    console.log('Exam status updated to published');

    // Get exam details with subjects
    const exam = await this.getExamById(examId);
    console.log('Exam details:', exam.exam_name, 'with', exam.schedule.length, 'subjects');
    
    // Get unique course IDs from exam schedule
    const courseIds = exam.schedule.map(s => s.course_id);
    
    if (courseIds.length === 0) {
      console.log('No subjects in exam, skipping notifications');
      return true;
    }

    console.log('Finding students enrolled in courses:', courseIds);

    // Get all students enrolled in these courses (removed is_active check from students)
    const [enrolledStudents] = await db.query(`
      SELECT DISTINCT s.id as student_id, u.id as user_id, u.email, u.first_name, u.last_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN course_enrollments ce ON s.id = ce.student_id
      WHERE ce.course_id IN (?) 
        AND ce.status = 'enrolled'
        AND u.is_active = true
    `, [courseIds]);

    console.log('Found', enrolledStudents.length, 'enrolled students');

    if (enrolledStudents.length === 0) {
      console.log('No enrolled students found, skipping notifications');
      return true;
    }

    // Create notification for enrolled students only
    const [notificationResult] = await db.query(`
      INSERT INTO notifications
      (title, content, type, priority, target_roles, is_published, created_by)
      VALUES (?, ?, 'announcement', 'high', ?, true, ?)
    `, [
      `${exam.exam_name} - Exam Schedule Published`,
      `The exam schedule for ${exam.exam_name} has been published. Please check your hall tickets section for exam details and seating information.`,
      JSON.stringify(['student']),
      publishedBy
    ]);

    const notificationId = notificationResult.insertId;
    console.log('Created notification:', notificationId);

    // Create user notifications for each enrolled student
    const userNotifications = enrolledStudents.map(student => [
      student.user_id,
      notificationId,
      `${exam.exam_name} - Exam Schedule Published`,
      `The exam schedule for ${exam.exam_name} has been published. You have ${exam.schedule.length} subject(s) in this exam. Please check your hall tickets section for exam details and seating information.`,
      'info'
    ]);

    if (userNotifications.length > 0) {
      await db.query(`
        INSERT INTO user_notifications
        (user_id, notification_id, title, message, type)
        VALUES ?
      `, [userNotifications]);
      console.log('Created', userNotifications.length, 'user notifications');
    }

    console.log('Exam published successfully');
    return true;
  }

  /**
   * Update exam
   */
  async updateExam(examId, data) {
    const {
      examName,
      examType,
      startDate,
      endDate,
      status
    } = data;

    const [result] = await db.query(`
      UPDATE exams 
      SET exam_name = ?, exam_type = ?, start_date = ?, end_date = ?, status = ?
      WHERE id = ?
    `, [examName, examType, startDate, endDate, status, examId]);

    return result.affectedRows > 0;
  }

  /**
   * Delete exam
   */
  async deleteExam(examId) {
    // Check if exam has allocations
    const [allocations] = await db.query(
      'SELECT COUNT(*) as count FROM seating_allocations WHERE exam_id = ?',
      [examId]
    );

    if (allocations[0].count > 0) {
      throw new Error('Cannot delete exam with existing seat allocations');
    }

    const [result] = await db.query('DELETE FROM exams WHERE id = ?', [examId]);
    return result.affectedRows > 0;
  }

  /**
   * Get exams for a student
   */
  async getStudentExams(studentId) {
    const [exams] = await db.query(`
      SELECT DISTINCT e.*, es.exam_date, es.start_time, es.end_time,
             c.name as course_name, c.code as course_code,
             sa.seat_number, r.room_name, r.building,
             ht.ticket_number, ht.status as ticket_status
      FROM exams e
      JOIN exam_schedule es ON e.id = es.exam_id
      JOIN courses c ON es.course_id = c.id
      JOIN course_enrollments ce ON c.id = ce.course_id
      LEFT JOIN seating_allocations sa ON e.id = sa.exam_id AND ce.student_id = sa.student_id
      LEFT JOIN rooms r ON sa.room_id = r.id
      LEFT JOIN hall_tickets ht ON e.id = ht.exam_id AND ce.student_id = ht.student_id
      WHERE ce.student_id = ? AND ce.status = 'enrolled' AND e.status = 'published'
      ORDER BY es.exam_date, es.start_time
    `, [studentId]);

    // Group by exam
    const examMap = {};
    exams.forEach(row => {
      if (!examMap[row.id]) {
        examMap[row.id] = {
          id: row.id,
          exam_name: row.exam_name,
          exam_type: row.exam_type,
          start_date: row.start_date,
          end_date: row.end_date,
          status: row.status,
          schedule: []
        };
      }

      examMap[row.id].schedule.push({
        exam_date: row.exam_date,
        start_time: row.start_time,
        end_time: row.end_time,
        course_name: row.course_name,
        course_code: row.course_code,
        seat_number: row.seat_number,
        room_name: row.room_name,
        building: row.building,
        ticket_number: row.ticket_number,
        ticket_status: row.ticket_status
      });
    });

    return Object.values(examMap);
  }

  /**
   * Get exam timetable for student
   */
  async getExamTimetable(examId, studentId) {
    const exam = await this.getExamById(examId);

    // Get student's enrolled courses for this exam
    const [schedule] = await db.query(`
      SELECT es.*, c.name as course_name, c.code as course_code,
             sa.seat_number, r.room_name, r.building, r.floor,
             ht.ticket_number, ht.status as ticket_status
      FROM exam_schedule es
      JOIN courses c ON es.course_id = c.id
      JOIN course_enrollments ce ON c.id = ce.course_id
      LEFT JOIN seating_allocations sa ON es.exam_id = sa.exam_id 
                                       AND ce.student_id = sa.student_id
                                       AND es.course_id = c.id
      LEFT JOIN rooms r ON sa.room_id = r.id
      LEFT JOIN hall_tickets ht ON es.exam_id = ht.exam_id 
                                AND ce.student_id = ht.student_id
      WHERE es.exam_id = ? AND ce.student_id = ? AND ce.status = 'enrolled'
      ORDER BY es.exam_date, es.start_time
    `, [examId, studentId]);

    return {
      ...exam,
      schedule
    };
  }

  /**
   * Add subject to exam
   */
  async addSubjectToExam(examId, subjectData) {
    const {
      courseId,
      examDate,
      startTime,
      endTime,
      durationMinutes,
      totalMarks
    } = subjectData;

    const [result] = await db.query(`
      INSERT INTO exam_schedule
      (exam_id, course_id, exam_date, start_time, end_time, duration_minutes, total_marks)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [examId, courseId, examDate, startTime, endTime, durationMinutes, totalMarks]);

    return result.insertId;
  }

  /**
   * Remove subject from exam
   */
  async removeSubjectFromExam(scheduleId) {
    const [result] = await db.query(
      'DELETE FROM exam_schedule WHERE id = ?',
      [scheduleId]
    );

    return result.affectedRows > 0;
  }

  /**
   * Get published exams for dropdown
   */
  async getPublishedExams() {
    const [exams] = await db.query(`
      SELECT id, exam_name, exam_type, start_date, end_date
      FROM exams
      WHERE status = 'published'
      ORDER BY start_date DESC
    `);

    return exams;
  }
}

module.exports = new ExamService();
