import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  getStudents(filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/students`, { params: filters });
  }

  updateAcademicStatus(studentId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/students/${studentId}/academic-status`, data);
  }

  reevaluateStudent(studentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/students/${studentId}/reevaluate`, {});
  }

  createCourse(course: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/courses`, course);
  }

  updateCourse(courseId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/courses/${courseId}`, data);
  }

  getPendingPayments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/payments/pending`);
  }

  approveFeePayment(paymentId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/payments/${paymentId}/approve`, {});
  }

  rejectFeePayment(paymentId: number, reason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/payments/${paymentId}/reject`, { reason });
  }

  getPendingHallTickets(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hall-tickets/pending`);
  }

  approveHallTicket(ticketId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/hall-tickets/${ticketId}/approve`, {});
  }

  bulkUploadHallTickets(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/hall-tickets/bulk-upload`, data);
  }

  getBulkUploadStatus(uploadId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/bulk-uploads/${uploadId}`);
  }

  createNotification(notification: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/notifications`, notification);
  }

  publishNotification(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${notificationId}/publish`, {});
  }

  getAllNotifications(filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications`, { params: filters });
  }

  generateReport(reportType: string, filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/${reportType}`, { params: filters });
  }

  createTimetableEntry(entry: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/timetable`, entry);
  }

  getAuditLogs(filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/audit-logs`, { params: filters });
  }
}
