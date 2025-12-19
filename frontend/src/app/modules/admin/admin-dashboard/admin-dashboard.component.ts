import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  dashboard: any = null;
  loading = true;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.adminService.getDashboard().subscribe({
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
