import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../services/student.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  events: any[] = [];
  loading = false;

  constructor(
    private studentService: StudentService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.studentService.getApprovedEvents().subscribe({
      next: (response) => {
        this.events = response.data || [];
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load events');
        this.loading = false;
      }
    });
  }

  participateInEvent(event: any): void {
    if (event.participation_status) {
      this.toast.info('You have already requested participation for this event');
      return;
    }

    if (confirm(`Request participation in "${event.title}"?`)) {
      this.studentService.participateInEvent(event.id).subscribe({
        next: () => {
          this.toast.success('Participation request submitted! Waiting for coordinator approval.');
          this.loadEvents();
        },
        error: (error) => {
          this.toast.error(error.error?.message || 'Failed to submit participation request');
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Requested';
    }
  }
}
