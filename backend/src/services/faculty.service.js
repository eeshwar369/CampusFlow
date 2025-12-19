const db = require('../config/database');

class FacultyService {
  /**
   * Get faculty dashboard
   */
  async getDashboard(facultyId) {
    const [faculty] = await db.query(`
      SELECT f.*, u.first_name, u.last_name, u.email
      FROM faculty f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ?
    `, [facultyId]);

    if (faculty.length === 0) {
      throw new Error('Faculty not found');
    }

    // Get assigned courses
    const [courses] = await db.query(`
      SELECT * FROM courses WHERE faculty_id = ?
    `, [facultyId]);

    // Get pending assignments
    const [pendingSubmissions] = await db.query(`
      SELECT COUNT(*) as count
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE c.faculty_id = ? AND asub.status = 'submitted'
    `, [facultyId]);

    return {
      faculty: faculty[0],
      courses,
      pendingSubmissions: pendingSubmissions[0].count
    };
  }

  /**
   * Get faculty courses
   */
  async getCourses(facultyId) {
    const [courses] = await db.query(`
      SELECT c.*, 
             COUNT(DISTINCT ce.student_id) as enrolled_students
      FROM courses c
      LEFT JOIN course_enrollments ce ON c.id = ce.course_id
      WHERE c.faculty_id = ?
      GROUP BY c.id
    `, [facultyId]);

    return courses;
  }

  /**
   * Upload course material
   */
  async uploadMaterial(facultyId, data) {
    const { courseId, title, description, fileType, filePath, fileSize } = data;

    // Verify faculty teaches this course
    const [courses] = await db.query(`
      SELECT * FROM courses WHERE id = ? AND faculty_id = ?
    `, [courseId, facultyId]);

    if (courses.length === 0) {
      throw new Error('Not authorized for this course');
    }

    const [result] = await db.query(`
      INSERT INTO course_materials
      (course_id, title, description, file_type, file_path, file_size, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [courseId, title, description, fileType, filePath, fileSize, facultyId]);

    return result.insertId;
  }

  /**
   * Create assignment
   */
  async createAssignment(facultyId, data) {
    const { courseId, title, description, dueDate, maxMarks, instructions } = data;

    // Verify faculty teaches this course
    const [courses] = await db.query(`
      SELECT * FROM courses WHERE id = ? AND faculty_id = ?
    `, [courseId, facultyId]);

    if (courses.length === 0) {
      throw new Error('Not authorized for this course');
    }

    const [result] = await db.query(`
      INSERT INTO assignments
      (course_id, title, description, due_date, max_marks, instructions, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [courseId, title, description, dueDate, maxMarks, instructions, facultyId]);

    return result.insertId;
  }

  /**
   * Get assignment submissions
   */
  async getSubmissions(facultyId, assignmentId) {
    // Verify faculty owns this assignment
    const [assignments] = await db.query(`
      SELECT a.* FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.id = ? AND c.faculty_id = ?
    `, [assignmentId, facultyId]);

    if (assignments.length === 0) {
      throw new Error('Not authorized for this assignment');
    }

    const [submissions] = await db.query(`
      SELECT asub.*, s.roll_number, u.first_name, u.last_name
      FROM assignment_submissions asub
      JOIN students s ON asub.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE asub.assignment_id = ?
      ORDER BY asub.submitted_at DESC
    `, [assignmentId]);

    return submissions;
  }

  /**
   * Grade assignment
   */
  async gradeAssignment(facultyId, submissionId, marksObtained, feedback) {
    // Verify faculty owns this assignment
    const [submissions] = await db.query(`
      SELECT asub.* FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      JOIN courses c ON a.course_id = c.id
      WHERE asub.id = ? AND c.faculty_id = ?
    `, [submissionId, facultyId]);

    if (submissions.length === 0) {
      throw new Error('Not authorized to grade this submission');
    }

    const [result] = await db.query(`
      UPDATE assignment_submissions
      SET marks_obtained = ?, feedback = ?, status = 'graded', graded_at = NOW()
      WHERE id = ?
    `, [marksObtained, feedback, submissionId]);

    return result.affectedRows > 0;
  }

  /**
   * Mark attendance
   */
  async markAttendance(facultyId, data) {
    const { courseId, date, studentAttendance } = data;

    // Verify faculty teaches this course
    const [courses] = await db.query(`
      SELECT * FROM courses WHERE id = ? AND faculty_id = ?
    `, [courseId, facultyId]);

    if (courses.length === 0) {
      throw new Error('Not authorized for this course');
    }

    // Insert attendance records
    const attendanceRecords = studentAttendance.map(record => [
      record.studentId,
      courseId,
      date,
      record.status,
      record.remarks || null,
      facultyId
    ]);

    await db.query(`
      INSERT INTO attendance
      (student_id, course_id, date, status, remarks, marked_by)
      VALUES ?
    `, [attendanceRecords]);

    return attendanceRecords.length;
  }

  /**
   * Get course attendance
   */
  async getCourseAttendance(facultyId, courseId) {
    // Verify faculty teaches this course
    const [courses] = await db.query(`
      SELECT * FROM courses WHERE id = ? AND faculty_id = ?
    `, [courseId, facultyId]);

    if (courses.length === 0) {
      throw new Error('Not authorized for this course');
    }

    const [attendance] = await db.query(`
      SELECT a.*, s.roll_number, u.first_name, u.last_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE a.course_id = ?
      ORDER BY a.date DESC, s.roll_number
    `, [courseId]);

    return attendance;
  }

  /**
   * Record student performance
   */
  async recordPerformance(facultyId, data) {
    const { studentId, courseId, assessmentType, marksObtained, maxMarks, remarks } = data;

    // Verify faculty teaches this course
    const [courses] = await db.query(`
      SELECT * FROM courses WHERE id = ? AND faculty_id = ?
    `, [courseId, facultyId]);

    if (courses.length === 0) {
      throw new Error('Not authorized for this course');
    }

    const [result] = await db.query(`
      INSERT INTO student_performance
      (student_id, course_id, assessment_type, marks_obtained, max_marks, remarks)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [studentId, courseId, assessmentType, marksObtained, maxMarks, remarks]);

    return result.insertId;
  }

  /**
   * Get student performance
   */
  async getStudentPerformance(facultyId, courseId, studentId = null) {
    // Verify faculty teaches this course
    const [courses] = await db.query(`
      SELECT * FROM courses WHERE id = ? AND faculty_id = ?
    `, [courseId, facultyId]);

    if (courses.length === 0) {
      throw new Error('Not authorized for this course');
    }

    let query = `
      SELECT sp.*, s.roll_number, u.first_name, u.last_name
      FROM student_performance sp
      JOIN students s ON sp.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE sp.course_id = ?
    `;
    const params = [courseId];

    if (studentId) {
      query += ' AND sp.student_id = ?';
      params.push(studentId);
    }

    query += ' ORDER BY sp.assessment_date DESC';

    const [performance] = await db.query(query, params);
    return performance;
  }

  /**
   * Get feedback received
   */
  async getFeedback(facultyId, courseId = null) {
    let query = `
      SELECT ff.*, c.name as course_name, s.roll_number, u.first_name, u.last_name
      FROM faculty_feedback ff
      JOIN courses c ON ff.course_id = c.id
      JOIN students s ON ff.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE ff.faculty_id = ?
    `;
    const params = [facultyId];

    if (courseId) {
      query += ' AND ff.course_id = ?';
      params.push(courseId);
    }

    query += ' ORDER BY ff.submitted_at DESC';

    const [feedback] = await db.query(query, params);
    return feedback;
  }

  /**
   * Get timetable
   */
  async getTimetable(facultyId) {
    const [timetable] = await db.query(`
      SELECT t.*, c.name as course_name, c.code as course_code
      FROM timetable t
      JOIN courses c ON t.course_id = c.id
      WHERE c.faculty_id = ?
      ORDER BY t.day_of_week, t.start_time
    `, [facultyId]);

    return timetable;
  }
}

module.exports = new FacultyService();
