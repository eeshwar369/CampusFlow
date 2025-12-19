import { Component, OnInit } from '@angular/core';
import { FacultyService } from '../../../services/faculty.service';

@Component({
  selector: 'app-faculty-dashboard',
  templateUrl: './faculty-dashboard.component.html',
  styleUrls: ['./faculty-dashboard.component.scss']
})
export class FacultyDashboardComponent implements OnInit {
  dashboard: any = null;
  loading = true;
  error: string | null = null;

  constructor(private facultyService: FacultyService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.facultyService.getDashboard().subscribe({
      next: (response) => {
        this.dashboard = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.error?.message || 'Failed to load dashboard';
        this.loading = false;
      }
    });
  }
}
