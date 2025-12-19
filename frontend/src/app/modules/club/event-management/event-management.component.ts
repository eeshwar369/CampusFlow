import { Component, OnInit } from '@angular/core';
import { ClubService } from '../../../services/club.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-event-management',
  templateUrl: './event-management.component.html',
  styleUrls: ['./event-management.component.scss']
})
export class EventManagementComponent implements OnInit {
  events: any[] = [];
  loading = false;
  showCreateForm = false;
  showEditForm = false;
  showCancelForm = false;
  selectedEvent: any = null;
  clubId = 1; // Should be dynamic based on user

  newEvent = {
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    maxParticipants: 50
  };

  editEvent = {
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    venue: ''
  };

  cancelReason = '';
  participants: any[] = [];
  changeLog: any[] = [];
  showParticipants = false;
  showChangeLog = false;

  constructor(
    private clubService: ClubService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.clubService.getEvents(this.clubId, true).subscribe({
      next: (data) => {
        this.events = data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load events');
        this.loading = false;
      }
    });
  }

  openCreateForm(): void {
    this.showCreateForm = true;
    this.resetNewEvent();
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
    this.resetNewEvent();
  }

  createEvent(): void {
    if (!this.newEvent.title || !this.newEvent.eventDate) {
      this.toast.warning('Please fill all required fields');
      return;
    }

    this.clubService.createEvent(this.clubId, this.newEvent).subscribe({
      next: () => {
        this.toast.success('Event created successfully!');
        this.closeCreateForm();
        this.loadEvents();
      },
      error: () => {
        this.toast.error('Failed to create event');
      }
    });
  }

  openEditForm(event: any): void {
    this.selectedEvent = event;
    this.editEvent = {
      title: event.title,
      description: event.description,
      eventDate: event.event_date,
      startTime: event.start_time,
      endTime: event.end_time,
      venue: event.venue
    };
    this.showEditForm = true;
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.selectedEvent = null;
  }

  updateEvent(): void {
    if (!this.selectedEvent) return;

    this.clubService.updateEvent(this.selectedEvent.id, this.editEvent).subscribe({
      next: (result) => {
        const changeCount = Object.keys(result.changes || {}).length;
        this.toast.success(`Event updated successfully! ${changeCount} changes made.`);
        this.closeEditForm();
        this.loadEvents();
      },
      error: () => {
        this.toast.error('Failed to update event');
      }
    });
  }

  openCancelForm(event: any): void {
    this.selectedEvent = event;
    this.cancelReason = '';
    this.showCancelForm = true;
  }

  closeCancelForm(): void {
    this.showCancelForm = false;
    this.selectedEvent = null;
    this.cancelReason = '';
  }

  cancelEvent(): void {
    if (!this.selectedEvent || !this.cancelReason) {
      this.toast.warning('Please provide a cancellation reason');
      return;
    }

    this.clubService.cancelEvent(this.selectedEvent.id, this.cancelReason).subscribe({
      next: () => {
        this.toast.success('Event cancelled and participants notified');
        this.closeCancelForm();
        this.loadEvents();
      },
      error: () => {
        this.toast.error('Failed to cancel event');
      }
    });
  }

  viewParticipants(event: any): void {
    this.selectedEvent = event;
    this.clubService.getEventParticipants(event.id).subscribe({
      next: (data) => {
        this.participants = data;
        this.showParticipants = true;
      },
      error: () => {
        this.toast.error('Failed to load participants');
      }
    });
  }

  closeParticipants(): void {
    this.showParticipants = false;
    this.participants = [];
    this.selectedEvent = null;
  }

  viewChangeLog(event: any): void {
    this.selectedEvent = event;
    this.clubService.getEventChangeLog(event.id).subscribe({
      next: (data) => {
        this.changeLog = data;
        this.showChangeLog = true;
      },
      error: () => {
        this.toast.error('Failed to load change log');
      }
    });
  }

  closeChangeLog(): void {
    this.showChangeLog = false;
    this.changeLog = [];
    this.selectedEvent = null;
  }

  resetNewEvent(): void {
    this.newEvent = {
      title: '',
      description: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      venue: '',
      maxParticipants: 50
    };
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'ongoing': return 'status-ongoing';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}
