import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacultyService } from '../../../services/faculty.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrls: ['./assignments.component.scss']
})
export class AssignmentsComponent implements OnInit {
  courseId: number = 0;
  assignments: any[] = [];
  showCreateForm = false;
  
  assignmentForm = {
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100,
    instructions: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private facultyService: FacultyService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.courseId = +this.route.snapshot.params['id'];
    this.loadAssignments();
  }

  loadAssignments() {
    this.facultyService.getAssignments(this.courseId).subscribe({
      next: (response) => {
        this.assignments = response.data;
      },
      error: () => {
        this.toast.error('Failed to load assignments');
      }
    });
  }

  createAssignment() {
    const data = {
      ...this.assignmentForm,
      courseId: this.courseId
    };

    this.facultyService.createAssignment(data).subscribe({
      next: () => {
        this.toast.success('Assignment created successfully');
        this.loadAssignments();
        this.resetForm();
        this.showCreateForm = false;
      },
      error: () => {
        this.toast.error('Failed to create assignment');
      }
    });
  }

  viewSubmissions(assignmentId: number) {
    this.router.navigate(['/faculty/assignments', assignmentId, 'grading']);
  }

  deleteAssignment(assignmentId: number) {
    if (confirm('Delete this assignment? All submissions will be lost.')) {
      this.facultyService.deleteAssignment(assignmentId).subscribe({
        next: () => {
          this.toast.success('Assignment deleted');
          this.loadAssignments();
        },
        error: () => {
          this.toast.error('Failed to delete assignment');
        }
      });
    }
  }

  resetForm() {
    this.assignmentForm = {
      title: '',
      description: '',
      dueDate: '',
      maxMarks: 100,
      instructions: ''
    };
  }
}
