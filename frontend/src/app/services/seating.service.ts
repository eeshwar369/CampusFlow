import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeatingService {
  private apiUrl = `${environment.apiUrl}/seating`;

  constructor(private http: HttpClient) {}

  // Exam Management
  createExam(data: any): Observable<any> {
    // Transform frontend data to backend format
    const payload = {
      examName: data.exam_name,
      examType: data.exam_type,
      startDate: data.start_date,
      endDate: data.end_date,
      subjects: data.subjects
    };
    return this.http.post(`${this.apiUrl}/exams`, payload);
  }

  getExams(): Observable<any> {
    return this.http.get(`${this.apiUrl}/exams`);
  }

  getExamById(examId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/exams/${examId}`);
  }

  updateExam(examId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/exams/${examId}`, data);
  }

  deleteExam(examId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/exams/${examId}`);
  }

  publishExam(examId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/exams/${examId}/publish`, {});
  }

  addSubjectToExam(examId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/exams/${examId}/subjects`, data);
  }

  removeSubjectFromExam(scheduleId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/exams/subjects/${scheduleId}`);
  }

  getPublishedExams(): Observable<any> {
    return this.http.get(`${this.apiUrl}/exams/published`);
  }

  // Seating Allocation
  allocateSeats(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/allocate`, data);
  }

  getSeatingChart(examId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/chart/${examId}`);
  }

  getStatistics(examId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics/${examId}`);
  }

  exportChart(examId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/export/${examId}`);
  }

  clearAllocations(examId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/allocations/${examId}`);
  }

  // Hall Tickets
  generateHallTickets(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/hall-tickets/generate`, data);
  }

  getHallTickets(examId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hall-tickets/${examId}`);
  }

  getHallTicketStatistics(examId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hall-tickets/${examId}/statistics`);
  }

  approveHallTickets(ticketIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/hall-tickets/approve`, { ticketIds });
  }

  // Room Availability
  getRoomAvailability(date: string, startTime: string, endTime: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/rooms/availability`, {
      params: { date, startTime, endTime }
    });
  }

  // Courses
  getCourses(): Observable<any> {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    return this.http.get(`${this.apiUrl}/courses?_t=${timestamp}`);
  }
}
