const db = require('../config/database');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class HallTicketService {
  /**
   * Generate hall ticket for a student
   */
  async generateHallTicket(studentId, examId) {
    try {
      // Get student and exam details
      const [students] = await db.query(`
        SELECT s.*, u.first_name, u.last_name, u.email, c.name as course_name
        FROM students s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN courses c ON s.department = c.department
        WHERE s.id = ?
      `, [studentId]);

      if (students.length === 0) {
        throw new Error('Student not found');
      }

      const student = students[0];

      const [exams] = await db.query(`
        SELECT e.*, c.name as course_name, c.code as course_code
        FROM exams e
        JOIN courses c ON e.course_id = c.id
        WHERE e.id = ?
      `, [examId]);

      if (exams.length === 0) {
        throw new Error('Exam not found');
      }

      const exam = exams[0];

      // Get seating allocation
      const [seating] = await db.query(`
        SELECT sa.*, r.room_name, r.building, r.floor
        FROM seating_allocations sa
        JOIN rooms r ON sa.room_id = r.id
        WHERE sa.student_id = ? AND sa.exam_id = ?
      `, [studentId, examId]);

      const seatInfo = seating.length > 0 ? seating[0] : null;

      // Generate ticket number
      const ticketNumber = `HT${exam.id}${studentId}${Date.now()}`;

      // Generate QR code data
      const qrData = JSON.stringify({
        ticketNumber,
        studentId,
        rollNumber: student.roll_number,
        examId,
        examName: exam.exam_name,
        seatNumber: seatInfo ? seatInfo.seat_number : 'TBA',
        timestamp: new Date().toISOString()
      });

      // Encrypt QR data
      const encryptedData = this.encryptData(qrData);
      const qrCodeDataUrl = await QRCode.toDataURL(encryptedData);

      // Generate PDF
      const fileName = `hall_ticket_${ticketNumber}.pdf`;
      const filePath = path.join(__dirname, '../../uploads/hall_tickets', fileName);

      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      await this.createPDF(filePath, {
        student,
        exam,
        seatInfo,
        ticketNumber,
        qrCodeDataUrl
      });

      // Save to database
      const [result] = await db.query(`
        INSERT INTO hall_tickets 
        (student_id, exam_id, ticket_number, qr_code, file_path, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `, [studentId, examId, ticketNumber, qrCodeDataUrl, filePath]);

      return {
        id: result.insertId,
        ticketNumber,
        filePath,
        qrCode: qrCodeDataUrl
      };
    } catch (error) {
      console.error('Hall ticket generation error:', error);
      throw error;
    }
  }

  /**
   * Create PDF document
   */
  async createPDF(filePath, data) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('HALL TICKET', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).text('Academic Exam Management System', { align: 'center' });
      doc.moveDown(2);

      // Ticket Number
      doc.fontSize(12).text(`Ticket Number: ${data.ticketNumber}`, { bold: true });
      doc.moveDown();

      // Student Details
      doc.fontSize(14).text('Student Details:', { underline: true });
      doc.fontSize(11);
      doc.text(`Name: ${data.student.first_name} ${data.student.last_name}`);
      doc.text(`Roll Number: ${data.student.roll_number}`);
      doc.text(`Department: ${data.student.department}`);
      doc.text(`Year: ${data.student.year}, Semester: ${data.student.semester}`);
      doc.moveDown();

      // Exam Details
      doc.fontSize(14).text('Exam Details:', { underline: true });
      doc.fontSize(11);
      doc.text(`Exam: ${data.exam.exam_name}`);
      doc.text(`Course: ${data.exam.course_name} (${data.exam.course_code})`);
      doc.text(`Date: ${new Date(data.exam.exam_date).toLocaleDateString()}`);
      doc.text(`Time: ${data.exam.start_time} - ${data.exam.end_time}`);
      doc.text(`Duration: ${data.exam.duration_minutes} minutes`);
      doc.moveDown();

      // Seating Details
      if (data.seatInfo) {
        doc.fontSize(14).text('Seating Details:', { underline: true });
        doc.fontSize(11);
        doc.text(`Room: ${data.seatInfo.room_name}`);
        doc.text(`Building: ${data.seatInfo.building}, Floor: ${data.seatInfo.floor}`);
        doc.text(`Seat Number: ${data.seatInfo.seat_number}`);
        doc.moveDown();
      } else {
        doc.fontSize(11).text('Seat allocation pending', { italics: true });
        doc.moveDown();
      }

      // QR Code
      doc.fontSize(14).text('QR Code:', { underline: true });
      doc.image(data.qrCodeDataUrl, { width: 150, height: 150 });
      doc.moveDown();

      // Instructions
      doc.fontSize(10).text('Instructions:', { underline: true });
      doc.fontSize(9);
      doc.text('1. Bring this hall ticket to the examination hall');
      doc.text('2. Carry a valid ID proof');
      doc.text('3. Report 30 minutes before exam time');
      doc.text('4. Mobile phones are not allowed');

      doc.end();

      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  /**
   * Encrypt data for QR code
   */
  encryptData(data) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.AES_SECRET_KEY || 'aes_secret_key_32_characters_long', 'utf8');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key.slice(0, 32), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Approve hall ticket
   */
  async approveHallTicket(ticketId, adminId) {
    const [result] = await db.query(`
      UPDATE hall_tickets 
      SET status = 'approved', approved_by = ?, approved_at = NOW()
      WHERE id = ?
    `, [adminId, ticketId]);

    return result.affectedRows > 0;
  }

  /**
   * Bulk generate hall tickets
   */
  async bulkGenerateHallTickets(examId, studentIds) {
    const results = {
      success: [],
      failed: []
    };

    for (const studentId of studentIds) {
      try {
        const ticket = await this.generateHallTicket(studentId, examId);
        results.success.push({ studentId, ticket });
      } catch (error) {
        results.failed.push({ studentId, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get hall ticket by student and exam
   */
  async getHallTicket(studentId, examId) {
    const [tickets] = await db.query(`
      SELECT ht.*, e.exam_name, s.roll_number
      FROM hall_tickets ht
      JOIN exams e ON ht.exam_id = e.id
      JOIN students s ON ht.student_id = s.id
      WHERE ht.student_id = ? AND ht.exam_id = ?
      ORDER BY ht.generated_at DESC
      LIMIT 1
    `, [studentId, examId]);

    return tickets.length > 0 ? tickets[0] : null;
  }
}

module.exports = new HallTicketService();
