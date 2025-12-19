import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-publish-notifications',
  templateUrl: './publish-notifications.component.html',
  styleUrls: ['./publish-notifications.component.scss']
})
export class PublishNotificationsComponent {
  notification = {
    title: '',
    message: '',
    type: 'announcement',
    priority: 'medium',
    targetRole: 'all'
  };

  loading = false;
  success = '';
  error = '';

  constructor(private http: HttpClient) {}

  publish(): void {
    if (!this.notification.title || !this.notification.message) {
      this.error = 'Please fill all required fields';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // Convert targetRole to targetRoles array
    let targetRoles: string[] = [];
    if (this.notification.targetRole === 'all') {
      targetRoles = ['student', 'faculty', 'admin'];
    } else {
      targetRoles = [this.notification.targetRole];
    }

    // Prepare payload matching backend expectations
    const payload = {
      title: this.notification.title,
      content: this.notification.message, // Backend expects 'content' not 'message'
      type: this.notification.type,
      priority: this.notification.priority,
      targetRoles: targetRoles // Backend expects 'targetRoles' array
    };

    this.http.post(`${environment.apiUrl}/admin/notifications`, payload)
      .subscribe({
        next: (response: any) => {
          const notificationId = response.data.id;
          
          // Publish the notification
          this.http.put(`${environment.apiUrl}/admin/notifications/${notificationId}/publish`, {})
            .subscribe({
              next: (publishResponse: any) => {
                this.loading = false;
                this.success = `Notification published successfully! ${publishResponse.data.usersNotified} users notified.`;
                this.resetForm();
                
                // Clear success message after 5 seconds
                setTimeout(() => {
                  this.success = '';
                }, 5000);
              },
              error: (err) => {
                this.loading = false;
                this.error = 'Failed to publish notification: ' + (err.error?.message || 'Unknown error');
              }
            });
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Failed to create notification: ' + (err.error?.message || 'Unknown error');
        }
      });
  }

  resetForm(): void {
    this.notification = {
      title: '',
      message: '',
      type: 'announcement',
      priority: 'medium',
      targetRole: 'all'
    };
  }
}
