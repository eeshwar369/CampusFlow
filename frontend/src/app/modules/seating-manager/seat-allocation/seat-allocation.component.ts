import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SeatingService } from '../../../services/seating.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-seat-allocation',
  templateUrl: './seat-allocation.component.html',
  styleUrls: ['./seat-allocation.component.scss']
})
export class SeatAllocationComponent implements OnInit {
  exams: any[] = [];
  selectedExam: any = null;
  
  config = {
    examId: null,
    spacing: 1,
    excludeDetained: true,
    randomize: false
  };

  allocating = false;
  allocated = false;
  allocationResult: any = null;
  
  loading = false;

  constructor(
    private seatingService: SeatingService,
    private toast: ToastService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.seatingService.getPublishedExams().subscribe({
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

  onExamSelect(): void {
    this.selectedExam = this.exams.find(e => e.id === this.config.examId);
    this.allocated = false;
    this.allocationResult = null;
  }

  allocateSeats(): void {
    if (!this.config.examId) {
      this.toast.error('Please select an exam');
      return;
    }

    if (confirm(`Allocate seats for ${this.selectedExam?.exam_name}?\n\nSpacing: ${this.config.spacing} seat(s)\nExclude Detained: ${this.config.excludeDetained ? 'Yes' : 'No'}\nRandomize: ${this.config.randomize ? 'Yes' : 'No'}`)) {
      this.allocating = true;
      
      this.seatingService.allocateSeats(this.config).subscribe({
        next: (response) => {
          this.allocationResult = response.data;
          this.allocated = true;
          this.allocating = false;
          this.toast.success(`Successfully allocated ${response.data.allocated} seats!`);
        },
        error: (error) => {
          this.toast.error(error.error?.message || 'Failed to allocate seats');
          this.allocating = false;
        }
      });
    }
  }

  clearAllocations(): void {
    if (!this.config.examId) return;

    if (confirm('Clear all seat allocations for this exam?')) {
      this.seatingService.clearAllocations(this.config.examId).subscribe({
        next: () => {
          this.toast.success('Allocations cleared successfully');
          this.allocated = false;
          this.allocationResult = null;
        },
        error: () => {
          this.toast.error('Failed to clear allocations');
        }
      });
    }
  }

  viewChart(): void {
    if (this.config.examId) {
      this.router.navigate(['/seating-manager/chart', this.config.examId]);
    }
  }
}
