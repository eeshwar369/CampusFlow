import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-approve-payments',
  templateUrl: './approve-payments.component.html',
  styleUrls: ['./approve-payments.component.scss']
})
export class ApprovePaymentsComponent implements OnInit {
  payments: any[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this.http.get(`${environment.apiUrl}/admin/payments/pending`)
      .subscribe({
        next: (response: any) => {
          this.payments = response.data || [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  approve(paymentId: number): void {
    this.http.put(`${environment.apiUrl}/admin/payments/${paymentId}/approve`, {})
      .subscribe({
        next: () => {
          alert('Payment approved');
          this.loadPayments();
        },
        error: () => alert('Failed to approve')
      });
  }

  reject(paymentId: number): void {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    this.http.put(`${environment.apiUrl}/admin/payments/${paymentId}/reject`, { reason })
      .subscribe({
        next: () => {
          alert('Payment rejected');
          this.loadPayments();
        },
        error: () => alert('Failed to reject')
      });
  }
}
