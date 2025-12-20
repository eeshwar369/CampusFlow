import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../services/student.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-hall-tickets',
  templateUrl: './hall-tickets.component.html',
  styleUrls: ['./hall-tickets.component.scss']
})
export class HallTicketsComponent implements OnInit {
  hallTickets: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadHallTickets();
  }

  loadHallTickets(): void {
    this.loading = true;
    this.studentService.getHallTickets().subscribe({
      next: (response) => {
        this.hallTickets = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.error?.message || 'Failed to load hall tickets';
        this.loading = false;
      }
    });
  }

  downloadTicket(ticket: any): void {
    const url = this.studentService.downloadHallTicket(ticket.id);
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `HallTicket_${ticket.ticket_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'delivered': 'status-delivered'
    };
    return statusMap[status] || '';
  }
}
