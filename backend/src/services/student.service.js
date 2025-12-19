const db = require('../config/database');

class StudentService {
  /**
   * Get student dashboard data
   */
  async getDashboard(studentId) {
    const [students] = await db.query(`
      SELECT s.*, u.first_name, u.last_name, u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [studentId]);

    if (students.length === 0) {
      throw new Error('Student not found');
    }

    const student = students[0];

    // Get enrolled courses
    const [courses] = await db.query(`
      SELECT c.*, ce.enrolled_at, ce.status
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      WHERE ce.student_id = ?
    `, [studentId]);

    // Get upcoming exams
    const [exams] = await db.query(`
      SELECT e.*, c.name as course_name, c.code as course_code
      FROM exams e
      JOIN courses c ON e.course_id = c.id
      WHERE e.exam_date >= CURDATE()
      ORDER BY e.exam_date ASC
      LIMIT 5
    `, []);

    // Get recent notifications
    const [notifications] = await db.query(`
      SELECT * FROM user_notifications
      WHERE user_id = ? AND is_read = false
      ORDER BY created_at DESC
      LIMIT 5
    `, [student.user_id]);

    // Get academic status
    const [status] = await db.query(`
      SELECT * FROM student_academic_status
      WHERE student_id = ?
      ORDER BY year DESC, semester DESC
      LIMIT 1
    `, [studentId]);

    return {
      student,
      courses,
      exams,
      notifications,
      academicStatus: status[0] || null
    };
  }

  /**
   * Get student courses
   */
  async getCourses(studentId) {
    const [courses] = await db.query(`
      SELECT c.*, ce.enrolled_at, ce.status,
             f.first_name as faculty_first_name, f.last_name as faculty_last_name
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.id
      LEFT JOIN faculty f ON c.faculty_id = f.id
      WHERE ce.student_id = ?
      ORDER BY c.semester, c.name
    `, [studentId]);

    return courses;
  }

  /**
   * Get course materials
   */
  async getCourseMaterials(studentId, courseId) {
    // Verify enrollment
    const [enrollment] = await db.query(`
      SELECT * FROM course_enrollments
      WHERE student_id = ? AND course_id = ?
    `, [studentId, courseId]);

    if (enrollment.length === 0) {
      throw new Error('Not enrolled in this course');
    }

    const [materials] = await db.query(`
      SELECT * FROM course_materials
      WHERE course_id = ?
      ORDER BY upload_date DESC
    `, [courseId]);

    return materials;
  }

  /**
   * Get student performance
   */
  async getPerformance(studentId) {
    const [performance] = await db.query(`
      SELECT sp.*, c.name as course_name, c.code as course_code
      FROM student_performance sp
      JOIN courses c ON sp.course_id = c.id
      WHERE sp.student_id = ?
      ORDER BY sp.assessment_date DESC
    `, [studentId]);

    return performance;
  }

  /**
   * Get study recommendations
   */
  async getRecommendations(studentId) {
    const [recommendations] = await db.query(`
      SELECT sr.*, c.name as course_name
      FROM study_recommendations sr
      JOIN courses c ON sr.course_id = c.id
      WHERE sr.student_id = ?
      ORDER BY sr.priority DESC, sr.created_at DESC
    `, [studentId]);

    return recommendations;
  }

  /**
   * Submit faculty feedback
   */
  async submitFeedback(studentId, data) {
    const { facultyId, courseId, rating, comments, category } = data;

    const [result] = await db.query(`
      INSERT INTO faculty_feedback
      (student_id, faculty_id, course_id, rating, comments, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [studentId, facultyId, courseId, rating, comments, category]);

    return result.insertId;
  }

  /**
   * Get hall tickets
   */
  async getHallTickets(studentId) {
    const [tickets] = await db.query(`
      SELECT ht.*, e.exam_name, e.exam_date, c.name as course_name
      FROM hall_tickets ht
      JOIN exams e ON ht.exam_id = e.id
      JOIN courses c ON e.course_id = c.id
      WHERE ht.student_id = ?
      ORDER BY e.exam_date DESC
    `, [studentId]);

    return tickets;
  }

  /**
   * Get attendance
   */
  async getAttendance(studentId, courseId = null) {
    let query = `
      SELECT a.*, c.name as course_name, c.code as course_code
      FROM attendance a
      JOIN courses c ON a.course_id = c.id
      WHERE a.student_id = ?
    `;
    const params = [studentId];

    if (courseId) {
      query += ' AND a.course_id = ?';
      params.push(courseId);
    }

    query += ' ORDER BY a.date DESC';

    const [attendance] = await db.query(query, params);
    return attendance;
  }

  /**
   * Get assignments
   */
  async getAssignments(studentId) {
    const [assignments] = await db.query(`
      SELECT a.*, c.name as course_name, c.code as course_code,
             asub.id as submission_id, asub.status as submission_status,
             asub.marks_obtained, asub.submitted_at
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN course_enrollments ce ON c.id = ce.course_id
      LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
      WHERE ce.student_id = ?
      ORDER BY a.due_date DESC
    `, [studentId, studentId]);

    return assignments;
  }

  /**
   * Submit assignment
   */
  async submitAssignment(studentId, assignmentId, filePath, comments) {
    const [result] = await db.query(`
      INSERT INTO assignment_submissions
      (assignment_id, student_id, file_path, comments, status)
      VALUES (?, ?, ?, ?, 'submitted')
    `, [assignmentId, studentId, filePath, comments]);

    return result.insertId;
  }

  /**
   * Get mind maps
   */
  async getMindMaps(studentId) {
    const [mindMaps] = await db.query(`
      SELECT mm.*, c.name as course_name
      FROM mind_maps mm
      JOIN courses c ON mm.course_id = c.id
      WHERE mm.student_id = ?
      ORDER BY mm.created_at DESC
    `, [studentId]);

    return mindMaps;
  }

  /**
   * Get club memberships
   */
  async getClubMemberships(studentId) {
    const [memberships] = await db.query(`
      SELECT cm.*, c.name as club_name, c.description
      FROM club_members cm
      JOIN clubs c ON cm.club_id = c.id
      WHERE cm.student_id = ?
    `, [studentId]);

    return memberships;
  }

  /**
   * Get events
   */
  async getEvents(studentId) {
    const [events] = await db.query(`
      SELECT e.*, c.name as club_name,
             ep.status as participation_status
      FROM events e
      LEFT JOIN clubs c ON e.club_id = c.id
      LEFT JOIN event_participants ep ON e.id = ep.event_id AND ep.student_id = ?
      WHERE e.event_date >= CURDATE()
      ORDER BY e.event_date ASC
    `, [studentId]);

    return events;
  }

  /**
   * Register for event
   */
  async registerForEvent(studentId, eventId) {
    const [result] = await db.query(`
      INSERT INTO event_participants
      (event_id, student_id, status)
      VALUES (?, ?, 'registered')
    `, [eventId, studentId]);

    return result.insertId;
  }
}

module.exports = new StudentService();
