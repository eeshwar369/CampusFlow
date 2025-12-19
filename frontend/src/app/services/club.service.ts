import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private apiUrl = `${environment.apiUrl}/club`;

  constructor(private http: HttpClient) {}

  getDashboard(clubId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${clubId}/dashboard`)
      .pipe(map(response => response.data));
  }

  getEvents(clubId: number, includeHistory: boolean = false): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/${clubId}/events?includeHistory=${includeHistory}`)
      .pipe(map(response => response.data));
  }

  createEvent(clubId: number, eventData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${clubId}/events`, eventData)
      .pipe(map(response => response.data));
  }

  updateEvent(eventId: number, eventData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/events/${eventId}`, eventData)
      .pipe(map(response => response.data));
  }

  cancelEvent(eventId: number, reason: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/events/${eventId}`, {
      body: { reason }
    }).pipe(map(response => response.data));
  }

  getEventParticipants(eventId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/events/${eventId}/participants`)
      .pipe(map(response => response.data));
  }

  getEventChangeLog(eventId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/events/${eventId}/change-log`)
      .pipe(map(response => response.data));
  }

  getAllClubs(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl)
      .pipe(map(response => response.data));
  }
}
