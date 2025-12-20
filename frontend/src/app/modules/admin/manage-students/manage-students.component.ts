import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-manage-students',
  templateUrl: './manage-students.component.html',
  styleUrls: ['./manage-students.component.scss']
})
export class ManageStudentsComponent implements OnInit {
  students: any[] = [];
  loading = false;
  error: string | null = null;
  filters = {
    department: '',
    year: '',
    semester: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;
    this.error = null;

    this.http.get(`${environment.apiUrl}/admin/students`, { params: this.filters })
      .subscribe({
        next: (response: any) => {
          this.students = response.data || [];
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error?.error?.message || 'Failed to load students';
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    this.loadStudents();
  }

  clearFilters(): void {
    this.filters = { department: '', year: '', semester: '' };
    this.loadStudents();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.department || this.filters.year || this.filters.semester);
  }

  updateStatus(studentId: number, status: string): void {
    if (!confirm(`Are you sure you want to change status to ${status}?`)) return;

    this.http.put(`${environment.apiUrl}/admin/students/${studentId}/academic-status`, {
      status,
      academicYear: new Date().getFullYear(),
      semester: 1,
      creditsEarned: 0,
      cgpa: 0
    }).subscribe({
      next: () => {
        alert('Status updated successfully');
        this.loadStudents();
      },
      error: (error) => {
        alert(error.error?.error?.message || 'Failed to update status');
      }
    });
  }

  reevaluateEligibility(studentId: number): void {
    if (!confirm('Re-evaluate student eligibility based on credits?')) return;

    this.http.post(`${environment.apiUrl}/admin/students/${studentId}/reevaluate`, {})
      .subscribe({
        next: (response: any) => {
          const result = response.data;
          alert(`Eligibility: ${result.eligible ? 'Eligible' : 'Not Eligible'}\nReason: ${result.reason}`);
          this.loadStudents();
        },
        error: (error) => {
          alert(error.error?.error?.message || 'Failed to re-evaluate');
        }
      });
  }
}
