import { Component, OnInit } from '@angular/core';
import { ClubService } from '../../../services/club.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
  members: any[] = [];
  loading = false;
  clubId = 1; // Default club ID

  constructor(
    private clubService: ClubService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading = true;
    this.clubService.getMembers(this.clubId).subscribe({
      next: (data) => {
        this.members = data;
        this.loading = false;
      },
      error: (error) => {
        this.toast.error('Failed to load members');
        this.loading = false;
      }
    });
  }
}
