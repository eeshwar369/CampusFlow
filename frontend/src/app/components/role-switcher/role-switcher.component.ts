import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-role-switcher',
  templateUrl: './role-switcher.component.html',
  styleUrls: ['./role-switcher.component.scss']
})
export class RoleSwitcherComponent implements OnInit {
  currentUser: User | null = null;
  availableRoles: string[] = [];
  activeRole: string = '';
  showDropdown = false;

  roleLabels: { [key: string]: string } = {
    'student': 'Student',
    'faculty': 'Faculty',
    'admin': 'Administrator',
    'seating_manager': 'Seating Manager',
    'club_coordinator': 'Club Coordinator'
  };

  roleIcons: { [key: string]: string } = {
    'student': '🎓',
    'faculty': '👨‍🏫',
    'admin': '⚙️',
    'seating_manager': '💺',
    'club_coordinator': '🎯'
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.availableRoles = this.authService.getUserRoles();
        this.activeRole = user.role;
      }
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  switchRole(role: string): void {
    if (role !== this.activeRole) {
      this.authService.switchRole(role);
      this.showDropdown = false;
    }
  }

  getRoleLabel(role: string): string {
    return this.roleLabels[role] || role;
  }

  getRoleIcon(role: string): string {
    return this.roleIcons[role] || '👤';
  }

  hasMultipleRoles(): boolean {
    return this.availableRoles.length > 1;
  }
}
