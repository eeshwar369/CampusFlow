const adminService = require('../services/admin.service');
const hallTicketService = require('../services/hallTicket.service');
const notificationService = require('../services/notification.service');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const dashboard = await adminService.getDashboard();
      res.json({ success: true, data: dashboard });
    } catch (error) {
      next(error);
    }
  }

  async getStudents(req, res, next) {
    try {
      const students = await adminService.getStudents(req.query);
      res.json({ success: true, data: students });
    } catch (error) {
      next(error);
    }
  }

  async getCourses(req, res, next) {
    try {
      const courses = await adminService.getCourses();
      res.json({ success: true, data: courses });
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req, res, next) {
    try {
      const courseId = await adminService.createCourse(req.body);
      res.json({ success: true, data: { id: courseId } });
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      await adminService.updateCourse(courseId, req.body);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async approveFeePayment(req, res, next) {
    try {
      const { paymentId } = req.params;
      const adminId = req.user.id;
      await adminService.approveFeePayment(paymentId, adminId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async rejectFeePayment(req, res, next) {
    try {
      const { paymentId } = req.params;
      const adminId = req.user.id;
      const { reason } = req.body;
      await adminService.rejectFeePayment(paymentId, adminId, reason);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async getPendingPayments(req, res, next) {
    try {
      const payments = await adminService.getPendingPayments();
      res.json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  }

  async getPendingHallTickets(req, res, next) {
    try {
      const tickets = await adminService.getPendingHallTickets();
      res.json({ success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  }

  async approveHallTicket(req, res, next) {
    try {
      const { ticketId } = req.params;
      const adminId = req.user.id;
      await hallTicketService.approveHallTicket(ticketId, adminId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async bulkUploadHallTickets(req, res, next) {
    try {
      const { examId, branch, tickets } = req.body;
      const uploadedBy = req.user.id;
      
      const result = await adminService.bulkUploadHallTickets({
        examId, branch, uploadedBy, tickets
      });
      
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getBulkUploadStatus(req, res, next) {
    try {
      const { uploadId } = req.params;
      const status = await adminService.getBulkUploadStatus(uploadId);
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }

  async updateAcademicStatus(req, res, next) {
    try {
      const { studentId } = req.params;
      await adminService.updateAcademicStatus(studentId, req.body);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async reevaluateStudentEligibility(req, res, next) {
    try {
      const { studentId } = req.params;
      const result = await adminService.reevaluateStudentEligibility(studentId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async generateReport(req, res, next) {
    try {
      const { reportType } = req.params;
      const report = await adminService.generateReport(reportType, req.query);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async createNotification(req, res, next) {
    try {
      const createdBy = req.user.id;
      const notificationId = await notificationService.createNotification({
        ...req.body,
        createdBy
      });
      res.json({ success: true, data: { id: notificationId } });
    } catch (error) {
      next(error);
    }
  }

  async publishNotification(req, res, next) {
    try {
      const { notificationId } = req.params;
      const result = await notificationService.publishNotification(notificationId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAllNotifications(req, res, next) {
    try {
      const notifications = await notificationService.getAllNotifications(req.query);
      res.json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async createTimetableEntry(req, res, next) {
    try {
      const entryId = await adminService.createTimetableEntry(req.body);
      res.json({ success: true, data: { id: entryId } });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const logs = await adminService.getAuditLogs(req.query);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }

  async getExams(req, res, next) {
    try {
      const exams = await adminService.getExams();
      res.json({ success: true, data: exams });
    } catch (error) {
      next(error);
    }
  }

  async getRooms(req, res, next) {
    try {
      const rooms = await adminService.getRooms();
      res.json({ success: true, data: rooms });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export students to Excel
   */
  async exportStudents(req, res, next) {
    try {
      const ExcelJS = require('exceljs');
      const students = await adminService.getAllStudentsForExport();
      
      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Students');
      
      // Define columns
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'First Name', key: 'first_name', width: 20 },
        { header: 'Last Name', key: 'last_name', width: 20 },
        { header: 'Roll Number', key: 'roll_number', width: 15 },
        { header: 'Department', key: 'department', width: 15 },
        { header: 'Year', key: 'year', width: 10 },
        { header: 'Semester', key: 'semester', width: 10 },
        { header: 'Active', key: 'is_active', width: 10 }
      ];
      
      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      
      // Add data rows
      students.forEach(student => {
        worksheet.addRow({
          id: student.id,
          email: student.email,
          first_name: student.first_name,
          last_name: student.last_name,
          roll_number: student.roll_number,
          department: student.department,
          year: student.year,
          semester: student.semester,
          is_active: student.is_active ? 'Yes' : 'No'
        });
      });
      
      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=students_${Date.now()}.xlsx`
      );
      
      // Write to response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Import students from Excel
   */
  async importStudents(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }

      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      
      const worksheet = workbook.getWorksheet('Students');
      if (!worksheet) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid Excel file: "Students" worksheet not found' 
        });
      }

      const result = await adminService.importStudentsFromExcel(worksheet);
      
      res.json({ 
        success: true, 
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
