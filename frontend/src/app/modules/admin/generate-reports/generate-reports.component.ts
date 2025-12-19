import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-generate-reports',
  templateUrl: './generate-reports.component.html',
  styleUrls: ['./generate-reports.component.scss']
})
export class GenerateReportsComponent {
  reportType = 'student_performance';
  generating = false;
  reportData: any = null;

  constructor(private http: HttpClient) {}

  generateReport(): void {
    this.generating = true;
    this.reportData = null;

    this.http.get(`${environment.apiUrl}/admin/reports/${this.reportType}`)
      .subscribe({
        next: (response: any) => {
          this.reportData = response.data;
          this.generating = false;
        },
        error: () => {
          alert('Failed to generate report');
          this.generating = false;
        }
      });
  }

  downloadReport(): void {
    const blob = new Blob([JSON.stringify(this.reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.reportType}_${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
