import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../services/student.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-assignment-submit',
  templateUrl: './assignment-submit.component.html',
  styleUrls: ['./assignment-submit.component.scss']
})
export class AssignmentSubmitComponent implements OnInit {
  assignmentId: number = 0;
  assignment: any = null;
  loading = false;
  submitting = false;
  
  submissionForm = {
    file: null as File | null,
    comments: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.assignmentId = +this.route.snapshot.params['id'];
    this.loadAssignment();
  }

  loadAssignment() {
    this.loading = true;
    this.studentService.getAssignmentDetail(this.assignmentId).subscribe({
      next: (response) => {
        this.assignment = response.data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load assignment');
        this.loading = false;
      }
    });
  }

  onFileSelect(event: any) {
    this.submissionForm.file = event.target.files[0];
  }

  submitAssignment() {
    if (!this.submissionForm.file) {
      this.toast.error('Please select a file to submit');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.submissionForm.file);
    formData.append('comments', this.submissionForm.comments);

    this.submitting = true;
    this.studentService.submitAssignment(this.assignmentId, formData).subscribe({
      next: () => {
        this.toast.success('Assignment submitted successfully');
        this.router.navigate(['/student/assignments']);
      },
      error: () => {
        this.toast.error('Failed to submit assignment');
        this.submitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/student/assignments']);
  }

  isOverdue(): boolean {
    if (!this.assignment) return false;
    return new Date(this.assignment.due_date) < new Date();
  }
}
