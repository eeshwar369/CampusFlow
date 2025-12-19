import { Component, OnInit } from '@angular/core';
import { ClubService } from '../../../services/club.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-approve-participations',
  templateUrl: './approve-participations.component.html',
  styleUrls: ['./approve-participations.component.scss']
})
export class ApproveParticipationsComponent implements OnInit {
  participations: any[] = [];
  loading = false;
  selectedParticipation: any = null;
  showRejectModal = false;
  rejectionReason = '';

  constructor(
    private clubService: ClubService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPendingParticipations();
  }

  loadPendingParticipations(): void {
    this.loading = true;
    this.clubService.getPendingParticipations().subscribe({
      next: (response) => {
        this.participations = response.data || [];
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load pending participations');
        this.loading = false;
      }
    });
  }

  approveParticipation(participation: any): void {
    if (confirm(`Approve participation for ${participation.first_name} ${participation.last_name}?`)) {
      this.clubService.approveParticipation(participation.id).subscribe({
        next: () => {
          this.toast.success('Participation approved!');
          this.loadPendingParticipations();
        },
        error: () => {
          this.toast.error('Failed to approve participation');
        }
      });
    }
  }

  openRejectModal(participation: any): void {
    this.selectedParticipation = participation;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedParticipation = null;
    this.rejectionReason = '';
  }

  rejectParticipation(): void {
    if (!this.rejectionReason.trim()) {
      this.toast.warning('Please provide a rejection reason');
      return;
    }

    this.clubService.rejectParticipation(this.selectedParticipation.id, this.rejectionReason).subscribe({
      next: () => {
        this.toast.success('Participation rejected');
        this.closeRejectModal();
        this.loadPendingParticipations();
      },
      error: () => {
        this.toast.error('Failed to reject participation');
      }
    });
  }
}
