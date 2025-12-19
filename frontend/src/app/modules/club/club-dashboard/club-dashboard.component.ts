import { Component, OnInit } from '@angular/core';
import { ClubService } from '../../../services/club.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-club-dashboard',
  templateUrl: './club-dashboard.component.html',
  styleUrls: ['./club-dashboard.component.scss']
})
export class ClubDashboardComponent implements OnInit {
  dashboard: any = null;
  loading = false;
  clubId = 1; // Default club ID, should be dynamic based on user

  constructor(
    private clubService: ClubService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.clubService.getDashboard(this.clubId).subscribe({
      next: (data) => {
        this.dashboard = data;
        this.loading = false;
      },
      error: (error) => {
        this.toast.error('Failed to load dashboard');
        this.loading = false;
      }
    });
  }
}
