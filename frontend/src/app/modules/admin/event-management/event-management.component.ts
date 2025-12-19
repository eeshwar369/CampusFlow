import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-event-management',
  templateUrl: './event-management.component.html',
  styleUrls: ['./event-management.component.scss']
})
export class EventManagementComponent implements OnInit {
  events: any[] = [];
  selectedEvent: any = null;
  editMode = false;
  loading = false;
  error: string | null = null;
  
  eventForm = {
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    status: 'scheduled'
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/club/events`)
      .subscribe({
        next: (response: any) => {
          this.events = response.data || [];
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load events';
          this.loading = false;
        }
      });
  }

  selectEvent(event: any): void {
    this.selectedEvent = event;
    this.eventForm = {
      title: event.title,
      description: event.description,
      eventDate: event.event_date,
      eventTime: event.event_time,
      venue: event.venue,
      status: event.status
    };
    this.editMode = true;
  }

  updateEvent(): void {
    if (!this.selectedEvent) return;

    this.http.put(`${environment.apiUrl}/club/events/${this.selectedEvent.id}`, {
      ...this.eventForm,
      reason: 'Event details updated by coordinator'
    }).subscribe({
      next: () => {
        this.loadEvents();
        this.cancelEdit();
        alert('Event updated successfully. Participants will be notified.');
      },
      error: (error) => {
        this.error = error.error?.error?.message || 'Failed to update event';
      }
    });
  }

  cancelEvent(event: any): void {
    if (!confirm('Are you sure you want to cancel this event?')) return;

    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    this.http.put(`${environment.apiUrl}/club/events/${event.id}`, {
      status: 'cancelled',
      reason
    }).subscribe({
      next: () => {
        this.loadEvents();
        alert('Event cancelled. Participants will be notified.');
      },
      error: (error) => {
        this.error = error.error?.error?.message || 'Failed to cancel event';
      }
    });
  }

  rescheduleEvent(event: any): void {
    this.selectEvent(event);
  }

  viewChangeLog(eventId: number): void {
    this.http.get(`${environment.apiUrl}/club/events/${eventId}/changes`)
      .subscribe({
        next: (response: any) => {
          console.log('Change log:', response.data);
          // Display in modal or separate view
        },
        error: () => {
          this.error = 'Failed to load change log';
        }
      });
  }

  viewParticipants(eventId: number): void {
    this.http.get(`${environment.apiUrl}/club/events/${eventId}/participants`)
      .subscribe({
        next: (response: any) => {
          console.log('Participants:', response.data);
          // Display in modal or separate view
        },
        error: () => {
          this.error = 'Failed to load participants';
        }
      });
  }

  cancelEdit(): void {
    this.editMode = false;
    this.selectedEvent = null;
    this.eventForm = {
      title: '',
      description: '',
      eventDate: '',
      eventTime: '',
      venue: '',
      status: 'scheduled'
    };
  }
}
