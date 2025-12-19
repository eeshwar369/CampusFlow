import { Component, OnInit } from '@angular/core';
import { SeatingService } from '../../../services/seating.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-hall-ticket-generation',
  templateUrl: './hall-ticket-generation.component.html',
  styleUrls: ['./hall-ticket-generation.component.scss']
})
export class HallTicketGenerationComponent implements OnInit {
  exams: any[] = [];
  selectedExamId: number | null = null;
  selectedExam: any = null;
  
  autoApprove = false;
  generating = false;
  generated = false;
  
  generationResult: any = null;
  hallTickets: any[] = [];
  statistics: any = null;
  
  loading = false;
  loadingTickets = false;

  constructor(
    private seatingService: SeatingService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.seatingService.getExams().subscribe({
      next: (response) => {
        this.exams = response.data || [];
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load exams');
        this.loading = false;
      }
    });
  }

  onExamSelect(): void {
    this.selectedExam = this.exams.find(e => e.id === this.selectedExamId);
    this.generated = false;
    this.generationResult = null;
    
    if (this.selectedExamId) {
      this.loadHallTickets();
      this.loadStatistics();
    }
  }

  loadHallTickets(): void {
    if (!this.selectedExamId) return;
    
    this.loadingTickets = true;
    this.seatingService.getHallTickets(this.selectedExamId).subscribe({
      next: (response) => {
        this.hallTickets = response.data || [];
        this.loadingTickets = false;
      },
      error: () => {
        this.loadingTickets = false;
      }
    });
  }

  loadStatistics(): void {
    if (!this.selectedExamId) return;
    
    this.seatingService.getHallTicketStatistics(this.selectedExamId).subscribe({
      next: (response) => {
        this.statistics = response.data;
      },
      error: () => {
        // Silent fail
      }
    });
  }

  generateHallTickets(): void {
    if (!this.selectedExamId) {
      this.toast.error('Please select an exam');
      return;
    }

    if (confirm(`Generate hall tickets for ${this.selectedExam?.exam_name}?\n\nAuto-approve: ${this.autoApprove ? 'Yes' : 'No'}`)) {
      this.generating = true;
      
      this.seatingService.generateHallTickets({
        examId: this.selectedExamId,
        autoApprove: this.autoApprove
      }).subscribe({
        next: (response) => {
          this.generationResult = response.data;
          this.generated = true;
          this.generating = false;
          this.toast.success(`Generated ${response.data.success.length} hall tickets!`);
          this.loadHallTickets();
          this.loadStatistics();
        },
        error: (error) => {
          this.toast.error(error.error?.message || 'Failed to generate hall tickets');
          this.generating = false;
        }
      });
    }
  }

  approveSelected(): void {
    const pendingTickets = this.hallTickets.filter(t => t.status === 'pending');
    
    if (pendingTickets.length === 0) {
      this.toast.error('No pending tickets to approve');
      return;
    }

    if (confirm(`Approve ${pendingTickets.length} pending hall tickets?`)) {
      const ticketIds = pendingTickets.map(t => t.id);
      
      this.seatingService.approveHallTickets(ticketIds).subscribe({
        next: (response) => {
          this.toast.success(`Approved ${response.data.approved} hall tickets`);
          this.loadHallTickets();
          this.loadStatistics();
        },
        error: () => {
          this.toast.error('Failed to approve tickets');
        }
      });
    }
  }

  downloadTicket(ticket: any): void {
    if (ticket.file_path) {
      window.open(ticket.file_path, '_blank');
    } else {
      this.toast.error('Ticket file not available');
    }
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'delivered': 'status-delivered'
    };
    return classes[status] || '';
  }
}
