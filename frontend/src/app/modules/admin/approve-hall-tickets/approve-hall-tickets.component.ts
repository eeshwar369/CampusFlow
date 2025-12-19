import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-approve-hall-tickets',
  templateUrl: './approve-hall-tickets.component.html',
  styleUrls: ['./approve-hall-tickets.component.scss']
})
export class ApproveHallTicketsComponent implements OnInit {
  tickets: any[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/admin/hall-tickets/pending`)
      .subscribe({
        next: (response: any) => {
          this.tickets = response.data || [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  approve(ticketId: number): void {
    this.http.put(`${environment.apiUrl}/admin/hall-tickets/${ticketId}/approve`, {})
      .subscribe({
        next: () => {
          alert('Hall ticket approved');
          this.loadTickets();
        },
        error: () => alert('Failed to approve')
      });
  }
}
