const db = require('../config/database');

class AdminService {
  /**
   * Get admin dashboard
   */
  async getDashboard() {
    // Get statistics
    const [studentCount] = await db.query('SELECT COUNT(*) as count FROM students');
    const [facultyCount] = await db.query('SELECT COUNT(*) as count FROM faculty');
    const [courseCount] = await db.query('SELECT COUNT(*) as count FROM courses');
    const [pendingPayments] = await db.query(`
      SELECT COUNT(*) as count FROM fee_payments WHERE status = 'pending'
    `);
    const [pendingTickets] = await db.query(`
      SELECT COUNT(*) as count FROM hall_tickets WHERE status = 'pending'
    `);

    return {
      students: studentCount[0].count,
      faculty: facultyCount[0].count,
      courses: courseCount[0].count,
      pendingPayments: pendingPayments[0].count,
      pendingTickets: pendingTickets[0].count
    };
  }

  /**
   * Get all students
   */
  async getStudents(filters = {}) {
    let query = `
      SELECT s.*, u.first_name, u.last_name, u.email,
             sas.status as academic_status,
             CASE WHEN sas.status = 'detained' THEN 1 ELSE 0 END as is_detained
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN student_academic_status sas ON s.id = sas.student_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.department) {
      query += ' AND s.department = ?';
      params.push(filters.department);
    }

    if (filters.year) {
      query += ' AND s.year = ?';
      params.push(filters.year);
    }

    if (filters.semester) {
      query += ' AND s.semester = ?';
      params.push(filters.semester);
    }

    query += ' ORDER BY s.roll_number';

    const [students] = await db.query(query, params);
    return students;
  }

  /**
   * Get all courses
   */
  async getCourses() {
    const [courses] = await db.query(`
      SELECT * FROM courses
      ORDER BY department, semester, name
    `);
    return courses;
  }

  /**
   * Create course
   */
  async createCourse(data) {
    const { name, code, department, semester, credits, year } = data;

    const [result] = await db.query(`
      INSERT INTO courses
      (name, code, department, semester, credits, year)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, code, department, semester, credits, year]);

    return result.insertId;
  }

  /**
   * Update course
   */
  async updateCourse(courseId, data) {
    const fields = [];
    const params = [];

    if (data.name) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.code) {
      fields.push('code = ?');
      params.push(data.code);
    }
    if (data.department) {
      fields.push('department = ?');
      params.push(data.department);
    }
    if (data.credits) {
      fields.push('credits = ?');
      params.push(data.credits);
    }
    if (data.semester) {
      fields.push('semester = ?');
      params.push(data.semester);
    }
    if (data.year) {
      fields.push('year = ?');
      params.push(data.year);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(courseId);

    const [result] = await db.query(`
      UPDATE courses SET ${fields.join(', ')} WHERE id = ?
    `, params);

    return result.affectedRows > 0;
  }

  /**
   * Approve fee payment
   */
  async approveFeePayment(paymentId, adminId) {
    const [result] = await db.query(`
      UPDATE fee_payments
      SET status = 'approved', approved_by = ?, approved_at = NOW()
      WHERE id = ?
    `, [adminId, paymentId]);

    return result.affectedRows > 0;
  }

  /**
   * Reject fee payment
   */
  async rejectFeePayment(paymentId, adminId, reason) {
    const [result] = await db.query(`
      UPDATE fee_payments
      SET status = 'rejected', approved_by = ?, approved_at = NOW(), remarks = ?
      WHERE id = ?
    `, [adminId, reason, paymentId]);

    return result.affectedRows > 0;
  }

  /**
   * Get pending fee payments
   */
  async getPendingPayments() {
    const [payments] = await db.query(`
      SELECT fp.*, s.roll_number, u.first_name, u.last_name
      FROM fee_payments fp
      JOIN students s ON fp.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE fp.status = 'pending'
      ORDER BY fp.payment_date DESC
    `);

    return payments;
  }

  /**
   * Get pending hall tickets
   */
  async getPendingHallTickets() {
    const [tickets] = await db.query(`
      SELECT ht.*, s.roll_number, u.first_name, u.last_name,
             e.exam_name, e.exam_date
      FROM hall_tickets ht
      JOIN students s ON ht.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN exams e ON ht.exam_id = e.id
      WHERE ht.status = 'pending'
      ORDER BY e.exam_date ASC
    `);

    return tickets;
  }

  /**
   * Bulk upload hall tickets
   */
  async bulkUploadHallTickets(data) {
    const { examId, branch, uploadedBy, tickets } = data;

    // Create bulk upload record
    const [uploadResult] = await db.query(`
      INSERT INTO bulk_uploads
      (upload_type, file_name, total_records, uploaded_by, status)
      VALUES ('hall_tickets', ?, ?, ?, 'processing')
    `, [`hall_tickets_${branch}_${Date.now()}.csv`, tickets.length, uploadedBy]);

    const uploadId = uploadResult.insertId;

    const results = {
      success: [],
      failed: []
    };

    for (const ticket of tickets) {
      try {
        // Find student by roll number
        const [students] = await db.query(`
          SELECT id FROM students WHERE roll_number = ?
        `, [ticket.rollNumber]);

        if (students.length === 0) {
          results.failed.push({
            rollNumber: ticket.rollNumber,
            error: 'Student not found'
          });
          continue;
        }

        const studentId = students[0].id;

        // Insert hall ticket
        await db.query(`
          INSERT INTO hall_tickets
          (student_id, exam_id, ticket_number, file_path, status, bulk_upload_id)
          VALUES (?, ?, ?, ?, 'approved', ?)
        `, [studentId, examId, ticket.ticketNumber, ticket.filePath, uploadId]);

        results.success.push({ rollNumber: ticket.rollNumber });
      } catch (error) {
        results.failed.push({
          rollNumber: ticket.rollNumber,
          error: error.message
        });
      }
    }

    // Update bulk upload record
    await db.query(`
      UPDATE bulk_uploads
      SET processed_records = ?, failed_records = ?, 
          error_details = ?, status = 'completed'
      WHERE id = ?
    `, [results.success.length, results.failed.length, 
        JSON.stringify(results.failed), uploadId]);

    return {
      uploadId,
      total: tickets.length,
      success: results.success.length,
      failed: results.failed.length,
      errors: results.failed
    };
  }

  /**
   * Get bulk upload status
   */
  async getBulkUploadStatus(uploadId) {
    const [uploads] = await db.query(`
      SELECT * FROM bulk_uploads WHERE id = ?
    `, [uploadId]);

    if (uploads.length === 0) {
      throw new Error('Upload not found');
    }

    return uploads[0];
  }

  /**
   * Update student academic status
   */
  async updateAcademicStatus(studentId, data) {
    const { academicYear, semester, creditsEarned, cgpa, status, isDetained } = data;

    // Check if record exists
    const [existing] = await db.query(`
      SELECT id FROM student_academic_status
      WHERE student_id = ? AND year = ? AND semester = ?
    `, [studentId, academicYear, semester]);

    if (existing.length > 0) {
      // Update existing
      await db.query(`
        UPDATE student_academic_status
        SET credits_earned = ?, cgpa = ?, status = ?
        WHERE id = ?
      `, [creditsEarned, cgpa, status, existing[0].id]);
    } else {
      // Insert new
      await db.query(`
        INSERT INTO student_academic_status
        (student_id, year, semester, credits_earned, cgpa, status, credits_required)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [studentId, academicYear, semester, creditsEarned, cgpa, status, creditsEarned * 1.33]);
    }

    return true;
  }

  /**
   * Re-evaluate student eligibility (edge case: credit shortage after promotion)
   */
  async reevaluateStudentEligibility(studentId) {
    // Get all academic records
    const [records] = await db.query(`
      SELECT * FROM student_academic_status
      WHERE student_id = ?
      ORDER BY year DESC, semester DESC
    `, [studentId]);

    if (records.length === 0) {
      return { eligible: true, reason: 'No records found' };
    }

    const totalCredits = records.reduce((sum, r) => sum + r.credits_earned, 0);
    const requiredCredits = records.length * 20; // Assuming 20 credits per semester

    const isEligible = totalCredits >= requiredCredits * 0.75; // 75% threshold

    // Update latest record
    const latestRecord = records[0];
    await db.query(`
      UPDATE student_academic_status
      SET status = ?
      WHERE id = ?
    `, [isEligible ? 'active' : 'detained', latestRecord.id]);

    return {
      eligible: isEligible,
      totalCredits,
      requiredCredits,
      reason: isEligible ? 'Eligible' : 'Credit shortage'
    };
  }

  /**
   * Generate analytical report
   */
  async generateReport(reportType, filters = {}) {
    switch (reportType) {
      case 'student_performance':
        return this.generateStudentPerformanceReport(filters);
      case 'attendance':
        return this.generateAttendanceReport(filters);
      case 'fee_payments':
        return this.generateFeePaymentReport(filters);
      case 'course_enrollment':
        return this.generateCourseEnrollmentReport(filters);
      default:
        throw new Error('Invalid report type');
    }
  }

  async generateStudentPerformanceReport(filters) {
    let query = `
      SELECT s.roll_number, u.first_name, u.last_name, s.department, s.year,
             AVG(sp.marks_obtained / sp.max_marks * 100) as avg_percentage,
             COUNT(sp.id) as total_assessments
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN student_performance sp ON s.id = sp.student_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.department) {
      query += ' AND s.department = ?';
      params.push(filters.department);
    }

    if (filters.year) {
      query += ' AND s.year = ?';
      params.push(filters.year);
    }

    query += ' GROUP BY s.id ORDER BY avg_percentage DESC';

    const [report] = await db.query(query, params);
    return report;
  }

  async generateAttendanceReport(filters) {
    let query = `
      SELECT s.roll_number, u.first_name, u.last_name, c.name as course_name,
             COUNT(a.id) as total_classes,
             SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
             (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(a.id) * 100) as attendance_percentage
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN attendance a ON s.id = a.student_id
      JOIN courses c ON a.course_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.courseId) {
      query += ' AND a.course_id = ?';
      params.push(filters.courseId);
    }

    query += ' GROUP BY s.id, c.id ORDER BY attendance_percentage DESC';

    const [report] = await db.query(query, params);
    return report;
  }

  async generateFeePaymentReport(filters) {
    const [report] = await db.query(`
      SELECT s.department, s.year,
             COUNT(fp.id) as total_payments,
             SUM(CASE WHEN fp.status = 'approved' THEN 1 ELSE 0 END) as approved,
             SUM(CASE WHEN fp.status = 'pending' THEN 1 ELSE 0 END) as pending,
             SUM(CASE WHEN fp.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
             SUM(fp.amount) as total_amount
      FROM fee_payments fp
      JOIN students s ON fp.student_id = s.id
      GROUP BY s.department, s.year
      ORDER BY s.department, s.year
    `);

    return report;
  }

  async generateCourseEnrollmentReport(filters) {
    const [report] = await db.query(`
      SELECT c.name, c.code, c.department, c.semester,
             COUNT(ce.id) as enrolled_students,
             f.first_name as faculty_first_name, f.last_name as faculty_last_name
      FROM courses c
      LEFT JOIN course_enrollments ce ON c.id = ce.course_id
      LEFT JOIN faculty f ON c.faculty_id = f.id
      GROUP BY c.id
      ORDER BY c.department, c.semester, c.name
    `);

    return report;
  }

  /**
   * Create timetable entry
   */
  async createTimetableEntry(data) {
    const { courseId, dayOfWeek, startTime, endTime, roomId } = data;

    const [result] = await db.query(`
      INSERT INTO timetable
      (course_id, day_of_week, start_time, end_time, room_id)
      VALUES (?, ?, ?, ?, ?)
    `, [courseId, dayOfWeek, startTime, endTime, roomId]);

    return result.insertId;
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters = {}) {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (filters.userId) {
      query += ' AND user_id = ?';
      params.push(filters.userId);
    }

    if (filters.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }

    if (filters.startDate) {
      query += ' AND created_at >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND created_at <= ?';
      params.push(filters.endDate);
    }

    query += ' ORDER BY created_at DESC LIMIT 1000';

    const [logs] = await db.query(query, params);
    return logs;
  }

  /**
   * Get all exams
   */
  async getExams() {
    const [exams] = await db.query(`
      SELECT e.*, c.name as course_name, c.code as course_code
      FROM exams e
      JOIN courses c ON e.course_id = c.id
      ORDER BY e.exam_date DESC
    `);
    return exams;
  }

  /**
   * Get all rooms
   */
  async getRooms() {
    const [rooms] = await db.query(`
      SELECT * FROM rooms
      WHERE is_available = true
      ORDER BY building, floor, room_name
    `);
    return rooms;
  }

  /**
   * Get all students for export
   */
  async getAllStudentsForExport() {
    const [students] = await db.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        s.roll_number,
        s.department,
        s.year,
        s.semester,
        u.is_active
      FROM users u
      INNER JOIN students s ON u.id = s.user_id
      WHERE u.role = 'student'
      ORDER BY s.department, s.year, s.roll_number
    `);
    return students;
  }

  /**
   * Import students from Excel worksheet
   */
  async importStudentsFromExcel(worksheet) {
    const bcrypt = require('bcrypt');
    const results = {
      created: 0,
      updated: 0,
      deactivated: 0,
      errors: []
    };

    // Skip header row
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      
      try {
        const id = row.getCell(1).value;
        const email = row.getCell(2).value;
        const firstName = row.getCell(3).value;
        const lastName = row.getCell(4).value;
        const rollNumber = row.getCell(5).value;
        const department = row.getCell(6).value;
        const year = row.getCell(7).value;
        const semester = row.getCell(8).value;
        const isActive = row.getCell(9).value;

        // Validate required fields
        if (!email || !firstName || !lastName || !rollNumber) {
          results.errors.push({
            row: i,
            error: 'Missing required fields',
            data: { email, firstName, lastName, rollNumber }
          });
          continue;
        }

        // Check if user exists
        const [existingUsers] = await db.query(
          'SELECT id FROM users WHERE id = ? OR email = ?',
          [id, email]
        );

        if (existingUsers.length > 0) {
          // Update existing user
          const userId = existingUsers[0].id;
          
          await db.query(`
            UPDATE users 
            SET first_name = ?, last_name = ?, email = ?, is_active = ?
            WHERE id = ?
          `, [firstName, lastName, email, isActive === 'Yes' ? 1 : 0, userId]);

          await db.query(`
            UPDATE students 
            SET roll_number = ?, department = ?, year = ?, semester = ?
            WHERE user_id = ?
          `, [rollNumber, department, year, semester, userId]);

          if (isActive === 'No') {
            results.deactivated++;
          } else {
            results.updated++;
          }
        } else {
          // Create new user
          const hashedPassword = await bcrypt.hash('password123', 10);
          
          const [userResult] = await db.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
            VALUES (?, ?, ?, ?, 'student', ?)
          `, [email, hashedPassword, firstName, lastName, isActive === 'Yes' ? 1 : 0]);

          const newUserId = userResult.insertId;

          await db.query(`
            INSERT INTO students (user_id, roll_number, department, year, semester)
            VALUES (?, ?, ?, ?, ?)
          `, [newUserId, rollNumber, department, year, semester]);

          results.created++;
        }
      } catch (error) {
        results.errors.push({
          row: i,
          error: error.message,
          data: {
            email: row.getCell(2).value,
            rollNumber: row.getCell(5).value
          }
        });
      }
    }

    return results;
  }
}

module.exports = new AdminService();
