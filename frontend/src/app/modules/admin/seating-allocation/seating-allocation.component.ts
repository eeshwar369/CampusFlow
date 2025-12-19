import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-seating-allocation',
  templateUrl: './seating-allocation.component.html',
  styleUrls: ['./seating-allocation.component.scss']
})
export class SeatingAllocationComponent implements OnInit {
  exams: any[] = [];
  rooms: any[] = [];
  selectedExam: number | null = null;
  allocating = false;
  allocationResult: any = null;
  error: string | null = null;
  seatingChart: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadExams();
    this.loadRooms();
  }

  loadExams(): void {
    this.http.get(`${environment.apiUrl}/admin/exams`)
      .subscribe({
        next: (response: any) => {
          this.exams = response.data || [];
        },
        error: () => {
          this.error = 'Failed to load exams';
        }
      });
  }

  loadRooms(): void {
    this.http.get(`${environment.apiUrl}/admin/rooms`)
      .subscribe({
        next: (response: any) => {
          this.rooms = response.data || [];
        },
        error: () => {
          this.error = 'Failed to load rooms';
        }
      });
  }

  allocateSeats(): void {
    if (!this.selectedExam) {
      this.error = 'Please select an exam';
      return;
    }

    this.allocating = true;
    this.error = null;

    this.http.post(`${environment.apiUrl}/seating/allocate`, {
      examId: this.selectedExam,
      excludeDetained: true
    }).subscribe({
      next: (response: any) => {
        this.allocationResult = response.data;
        this.allocating = false;
        this.generateSeatingChart();
      },
      error: (error) => {
        this.error = error.error?.error?.message || 'Allocation failed';
        this.allocating = false;
      }
    });
  }

  generateSeatingChart(): void {
    if (!this.selectedExam) return;

    this.http.get(`${environment.apiUrl}/seating/chart/${this.selectedExam}`)
      .subscribe({
        next: (response: any) => {
          this.seatingChart = response.data;
        },
        error: () => {
          this.error = 'Failed to generate seating chart';
        }
      });
  }

  downloadChart(): void {
    if (!this.seatingChart) return;

    const blob = new Blob([JSON.stringify(this.seatingChart, null, 2)], 
      { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seating_chart_exam_${this.selectedExam}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  printChart(): void {
    window.print();
  }
}
