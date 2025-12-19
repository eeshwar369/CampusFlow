import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacultyService {
  private apiUrl = `${environment.apiUrl}/faculty`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  getCourses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses`);
  }

  uploadMaterial(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/materials`, formData);
  }

  createAssignment(assignment: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/assignments`, assignment);
  }

  getSubmissions(assignmentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/assignments/${assignmentId}/submissions`);
  }

  gradeAssignment(submissionId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/submissions/${submissionId}/grade`, data);
  }

  markAttendance(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/attendance`, data);
  }

  getCourseAttendance(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses/${courseId}/attendance`);
  }

  recordPerformance(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/performance`, data);
  }

  getStudentPerformance(courseId: number, studentId?: number): Observable<any> {
    if (studentId) {
      return this.http.get(`${this.apiUrl}/courses/${courseId}/performance`, { 
        params: { studentId: studentId.toString() } 
      });
    }
    return this.http.get(`${this.apiUrl}/courses/${courseId}/performance`);
  }

  getFeedback(courseId?: number): Observable<any> {
    if (courseId) {
      return this.http.get(`${this.apiUrl}/feedback`, { 
        params: { courseId: courseId.toString() } 
      });
    }
    return this.http.get(`${this.apiUrl}/feedback`);
  }

  getTimetable(): Observable<any> {
    return this.http.get(`${this.apiUrl}/timetable`);
  }
}
