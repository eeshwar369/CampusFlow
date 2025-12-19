import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SeatingService } from '../../../services/seating.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-seating-manager-dashboard',
  templateUrl: './seating-manager-dashboard.component.html',
  styleUrls: ['./seating-manager-dashboard.component.scss']
})
export class SeatingManagerDashboardComponent implements OnInit {
  stats = {
    totalExams: 0,
    allocatedExams: 0,
    pendingTickets: 0,
    approvedTickets: 0
  };

  recentAllocations: any[] = [];
  upcomingExams: any[] = [];
  loading = false;

  constructor(
    private seatingService: SeatingService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load exams
    this.seatingService.getExams().subscribe({
      next: (response) => {
        const exams = response.data || [];
        this.upcomingExams = exams.filter((e: any) => new Date(e.exam_date) >= new Date()).slice(0, 5);
        this.stats.totalExams = exams.length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  navigateToExams(): void {
    this.router.navigate(['/seating-manager/exams']);
  }

  navigateToAllocate(): void {
    this.router.navigate(['/seating-manager/allocate']);
  }

  navigateToHallTickets(): void {
    this.router.navigate(['/seating-manager/hall-tickets']);
  }

  viewChart(examId: number): void {
    this.router.navigate(['/seating-manager/chart', examId]);
  }
}
