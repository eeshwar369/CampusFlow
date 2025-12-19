import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  dashboard: any = null;
  loading = true;
  error: string | null = null;

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.studentService.getDashboard().subscribe({
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
