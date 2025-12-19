import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-approve-events',
  templateUrl: './approve-events.component.html',
  styleUrls: ['./approve-events.component.scss']
})
export class ApproveEventsComponent implements OnInit {
  pendingEvents: any[] = [];
  loading = false;
  selectedEvent: any = null;
  showRejectModal = false;
  rejectionReason = '';

  constructor(
    private adminService: AdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPendingEvents();
  }

  loadPendingEvents(): void {
    this.loading = true;
    this.adminService.getPendingEvents().subscribe({
      next: (response) => {
        console.log('Pending events response:', response);
        this.pendingEvents = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pending events:', error);
        const errorMsg = error.error?.message || error.message || 'Failed to load pending events';
        this.toast.error(errorMsg);
        this.loading = false;
      }
    });
  }

  approveEvent(event: any): void {
    if (confirm(`Approve event "${event.title}"? This will notify all students.`)) {
      this.adminService.approveEvent(event.id).subscribe({
        next: () => {
          this.toast.success('Event approved! Students have been notified.');
          this.loadPendingEvents();
        },
        error: () => {
          this.toast.error('Failed to approve event');
        }
      });
    }
  }

  openRejectModal(event: any): void {
    this.selectedEvent = event;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedEvent = null;
    this.rejectionReason = '';
  }

  rejectEvent(): void {
    if (!this.rejectionReason.trim()) {
      this.toast.warning('Please provide a rejection reason');
      return;
    }

    this.adminService.rejectEvent(this.selectedEvent.id, this.rejectionReason).subscribe({
      next: () => {
        this.toast.success('Event rejected');
        this.closeRejectModal();
        this.loadPendingEvents();
      },
      error: () => {
        this.toast.error('Failed to reject event');
      }
    });
  }
}
