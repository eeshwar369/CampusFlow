import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FacultyService } from '../../../services/faculty.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-assignment-grading',
  templateUrl: './assignment-grading.component.html',
  styleUrls: ['./assignment-grading.component.scss']
})
export class AssignmentGradingComponent implements OnInit {
  assignmentId: number = 0;
  submissions: any[] = [];
  selectedSubmission: any = null;
  
  gradingForm = {
    marksObtained: 0,
    feedback: ''
  };

  constructor(
    private route: ActivatedRoute,
    private facultyService: FacultyService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.assignmentId = +this.route.snapshot.params['id'];
    this.loadSubmissions();
  }

  loadSubmissions() {
    this.facultyService.getSubmissions(this.assignmentId).subscribe({
      next: (response) => {
        this.submissions = response.data;
      },
      error: () => {
        this.toast.error('Failed to load submissions');
      }
    });
  }

  selectSubmission(submission: any) {
    this.selectedSubmission = submission;
    this.gradingForm = {
      marksObtained: submission.marks_obtained || 0,
      feedback: submission.feedback || ''
    };
  }

  gradeSubmission() {
    if (!this.selectedSubmission) return;

    this.facultyService.gradeAssignment(this.selectedSubmission.id, this.gradingForm).subscribe({
      next: () => {
        this.toast.success('Graded successfully');
        this.loadSubmissions();
        this.selectedSubmission = null;
      },
      error: () => {
        this.toast.error('Failed to grade submission');
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'graded': return 'status-graded';
      case 'submitted': return 'status-submitted';
      default: return 'status-pending';
    }
  }
}
