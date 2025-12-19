import { Component, OnInit } from '@angular/core';
import { SeatingService } from '../../../services/seating.service';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

interface Exam {
  id?: number;
  exam_name: string;
  exam_type: string;
  start_date: string;
  end_date: string;
  status: string;
  subject_count?: number;
  allocated_count?: number;
  created_by_name?: string;
  schedule?: any[];
}

interface Subject {
  courseId: number;
  examDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalMarks: number;
}

@Component({
  selector: 'app-exam-management',
  templateUrl: './exam-management.component.html',
  styleUrls: ['./exam-management.component.scss']
})
export class ExamManagementComponent implements OnInit {
  exams: Exam[] = [];
  courses: any[] = [];
  loading = false;
  showCreateForm = false;
  showSubjectForm = false;
  selectedExam: Exam | null = null;

  // Form data
  examForm: Exam = {
    exam_name: '',
    exam_type: 'mid-term',
    start_date: '',
    end_date: '',
    status: 'draft'
  };

  subjects: Subject[] = [];
  currentSubject: Subject = {
    courseId: 0,
    examDate: '',
    startTime: '',
    endTime: '',
    durationMinutes: 120,
    totalMarks: 100
  };

  examTypes = [
    { value: 'mid-term', label: 'Mid-Term' },
    { value: 'end-term', label: 'End-Term' },
    { value: 'regular', label: 'Regular' },
    { value: 'supplementary', label: 'Supplementary' }
  ];

  constructor(
    private seatingService: SeatingService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadExams();
    this.loadCourses();
  }

  loadExams(): void {
    this.loading = true;
    this.seatingService.getExams().subscribe({
      next: (response) => {
        this.exams = response.data || [];
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load exams');
        this.loading = false;
      }
    });
  }

  loadCourses(): void {
    console.log('Loading courses...');
    this.seatingService.getCourses().subscribe({
      next: (response: any) => {
        console.log('Courses loaded:', response);
        this.courses = response.data || [];
        if (this.courses.length === 0) {
          this.toast.error('No courses found. Please add courses first.');
        }
      },
      error: (error) => {
        console.error('Failed to load courses:', error);
        this.toast.error('Failed to load courses: ' + (error.error?.message || error.message));
      }
    });
  }

  openCreateForm(): void {
    this.showCreateForm = true;
    this.examForm = {
      exam_name: '',
      exam_type: 'mid-term',
      start_date: '',
      end_date: '',
      status: 'draft'
    };
    this.subjects = [];
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
    this.examForm = {
      exam_name: '',
      exam_type: 'mid-term',
      start_date: '',
      end_date: '',
      status: 'draft'
    };
    this.subjects = [];
  }

  addSubject(): void {
    if (!this.currentSubject.courseId || !this.currentSubject.examDate) {
      this.toast.error('Please fill all subject details');
      return;
    }

    this.subjects.push({ ...this.currentSubject });
    this.currentSubject = {
      courseId: 0,
      examDate: '',
      startTime: '',
      endTime: '',
      durationMinutes: 120,
      totalMarks: 100
    };
    this.toast.success('Subject added');
  }

  removeSubject(index: number): void {
    this.subjects.splice(index, 1);
    this.toast.success('Subject removed');
  }

  getCourseName(courseId: number): string {
    const course = this.courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.name}` : 'Unknown';
  }

  createExam(): void {
    if (!this.examForm.exam_name || !this.examForm.start_date || !this.examForm.end_date) {
      this.toast.error('Please fill all required fields');
      return;
    }

    if (this.subjects.length === 0) {
      this.toast.error('Please add at least one subject');
      return;
    }

    this.loading = true;
    this.seatingService.createExam({
      ...this.examForm,
      subjects: this.subjects
    }).subscribe({
      next: () => {
        this.toast.success('Exam created successfully');
        this.closeCreateForm();
        this.loadExams();
      },
      error: () => {
        this.toast.error('Failed to create exam');
        this.loading = false;
      }
    });
  }

  viewExam(exam: Exam): void {
    this.loading = true;
    this.seatingService.getExamById(exam.id!).subscribe({
      next: (response) => {
        this.selectedExam = response.data;
        this.loading = false;
      },
      error: () => {
        this.toast.error('Failed to load exam details');
        this.loading = false;
      }
    });
  }

  closeExamDetails(): void {
    this.selectedExam = null;
  }

  publishExam(examId: number): void {
    if (!confirm('Are you sure you want to publish this exam? Students will be able to see it.')) {
      return;
    }

    this.loading = true;
    this.seatingService.publishExam(examId).subscribe({
      next: () => {
        this.toast.success('Exam published successfully. Students can now view the exam schedule.');
        this.loadExams();
        if (this.selectedExam && this.selectedExam.id === examId) {
          this.selectedExam.status = 'published';
        }
      },
      error: () => {
        this.toast.error('Failed to publish exam');
        this.loading = false;
      }
    });
  }

  deleteExam(examId: number): void {
    if (!confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }

    this.loading = true;
    this.seatingService.deleteExam(examId).subscribe({
      next: () => {
        this.toast.success('Exam deleted successfully');
        this.loadExams();
        if (this.selectedExam && this.selectedExam.id === examId) {
          this.closeExamDetails();
        }
      },
      error: (error) => {
        this.toast.error(error.error?.message || 'Failed to delete exam');
        this.loading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'draft': return 'badge-secondary';
      case 'published': return 'badge-success';
      case 'ongoing': return 'badge-primary';
      case 'completed': return 'badge-info';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }
}
