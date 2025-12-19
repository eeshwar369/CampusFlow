import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/student`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  getCourses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses`);
  }

  getCourseMaterials(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses/${courseId}/materials`);
  }

  getPerformance(): Observable<any> {
    return this.http.get(`${this.apiUrl}/performance`);
  }

  getRecommendations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recommendations`);
  }

  submitFeedback(feedback: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/feedback`, feedback);
  }

  getHallTickets(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hall-tickets`);
  }

  getAttendance(courseId?: number): Observable<any> {
    if (courseId) {
      return this.http.get(`${this.apiUrl}/attendance`, { 
        params: { courseId: courseId.toString() } 
      });
    }
    return this.http.get(`${this.apiUrl}/attendance`);
  }

  getAssignments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/assignments`);
  }

  submitAssignment(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/assignments/submit`, formData);
  }

  getMindMaps(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mind-maps`);
  }

  getClubMemberships(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clubs/memberships`);
  }

  getEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`);
  }

  registerForEvent(eventId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/register`, { eventId });
  }

  getNotifications(unreadOnly: boolean = false): Observable<any> {
    const params = { unreadOnly: unreadOnly.toString() };
    return this.http.get(`${this.apiUrl}/notifications`, { params });
  }

  markNotificationRead(notificationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  getApprovedEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`);
  }

  participateInEvent(eventId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${eventId}/participate`, {});
  }

  // Exam Timetable
  getExams(): Observable<any> {
    return this.http.get(`${this.apiUrl}/exams`);
  }

  getExamTimetable(examId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/exams/${examId}/timetable`);
  }
}
