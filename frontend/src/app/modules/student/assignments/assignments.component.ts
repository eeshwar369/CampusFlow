import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../../../services/student.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss']
})
export class AssignmentsComponent implements OnInit {
  assignments: any[] = [];
  loading = false;

  constructor(
    private router: Router,
    private studentService: StudentService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadAssignments();
  }

  loadAssignments() {
    this.loading = true;
    this.studentService.getAssignments().subscribe({
      next: (response) => {
        this.assignments = response.data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load assignments');
        this.loading = false;
      }
    });
  }

  submitAssignment(assignmentId: number) {
    this.router.navigate(['/student/assignments', assignmentId, 'submit']);
  }

  getStatusClass(assignment: any): string {
    if (assignment.submission_status === 'graded') return 'status-graded';
    if (assignment.submission_status === 'submitted') return 'status-submitted';
    if (new Date(assignment.due_date) < new Date()) return 'status-overdue';
    return 'status-pending';
  }

  getStatusText(assignment: any): string {
    if (assignment.submission_status === 'graded') {
      return `Graded: ${assignment.marks_obtained} marks`;
    }
    if (assignment.submission_status === 'submitted') {
      return 'Submitted - Awaiting Grade';
    }
    if (new Date(assignment.due_date) < new Date()) {
      return 'Overdue';
    }
    return 'Not Submitted';
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  canSubmit(assignment: any): boolean {
    return !assignment.submission_status && !this.isOverdue(assignment.due_date);
  }
}
