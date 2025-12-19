import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../services/student.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  loading = false;
  showUnreadOnly = false;

  constructor(
    private studentService: StudentService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.studentService.getNotifications(this.showUnreadOnly).subscribe({
      next: (response) => {
        this.notifications = response.data || [];
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load notifications');
        this.loading = false;
      }
    });
  }

  toggleFilter(): void {
    this.showUnreadOnly = !this.showUnreadOnly;
    this.loadNotifications();
  }

  markAsRead(notification: any): void {
    if (notification.is_read) return;

    this.studentService.markNotificationRead(notification.id).subscribe({
      next: () => {
        notification.is_read = true;
        this.toast.success('Notification marked as read');
      },
      error: () => {
        this.toast.error('Failed to mark notification as read');
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'event':
        return '📅';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  }

  getNotificationClass(type: string): string {
    return `notification-${type}`;
  }
}
