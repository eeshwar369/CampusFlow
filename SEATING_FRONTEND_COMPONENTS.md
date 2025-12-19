# Seating Manager Frontend - Component Implementation

## Components Created ✅

1. ✅ Dashboard Component
2. ⏳ Seat Allocation Component (code below)
3. ⏳ Hall Ticket Generation Component (code below)
4. ⏳ Seating Chart Component (code below)

---

## Seat Allocation Component

### TypeScript (seat-allocation.component.ts)

```typescript
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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.seatingService.getExams().subscribe({
      next: (response) => {
        this.exams = response.data || [];
        this.loading = false;
      },
      error: (error) => {
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
```

### HTML (seat-allocation.component.html)

```html
<app-header></app-header>

<div class="allocation-container">
  <div class="page-header">
    <h1>🪑 Seat Allocation</h1>
    <p>Intelligently allocate seats for exams with configurable spacing</p>
  </div>

  <div class="allocation-form card">
    <h2>Configuration</h2>

    <!-- Exam Selection -->
    <div class="form-group">
      <label for="exam">Select Exam *</label>
      <select 
        id="exam" 
        [(ngModel)]="config.examId" 
        (change)="onExamSelect()"
        [disabled]="allocating">
        <option [ngValue]="null">-- Select Exam --</option>
        <option *ngFor="let exam of exams" [ngValue]="exam.id">
          {{ exam.exam_name }} - {{ exam.exam_date | date:'mediumDate' }}
        </option>
      </select>
    </div>

    <!-- Spacing Configuration -->
    <div class="form-group">
      <label for="spacing">Seat Spacing</label>
      <select id="spacing" [(ngModel)]="config.spacing" [disabled]="allocating">
        <option [ngValue]="1">1 seat apart (Normal)</option>
        <option [ngValue]="2">2 seats apart (Social Distancing)</option>
        <option [ngValue]="3">3 seats apart (Maximum Spacing)</option>
      </select>
      <small>Determines how many seats to leave between students</small>
    </div>

    <!-- Options -->
    <div class="form-group">
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          [(ngModel)]="config.excludeDetained"
          [disabled]="allocating">
        <span>Exclude Detained Students</span>
      </label>
      <small>Students with detained status will not be allocated seats</small>
    </div>

    <div class="form-group">
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          [(ngModel)]="config.randomize"
          [disabled]="allocating">
        <span>Randomize Seating</span>
      </label>
      <small>Randomly assign seats instead of alphabetical order</small>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button 
        class="btn btn-primary btn-lg"
        (click)="allocateSeats()"
        [disabled]="!config.examId || allocating">
        <span *ngIf="!allocating">🪑 Allocate Seats</span>
        <span *ngIf="allocating">⏳ Allocating...</span>
      </button>

      <button 
        class="btn btn-secondary"
        (click)="clearAllocations()"
        [disabled]="!config.examId || allocating || !allocated">
        🗑️ Clear Allocations
      </button>
    </div>
  </div>

  <!-- Allocation Result -->
  <div *ngIf="allocated && allocationResult" class="result-card card success">
    <h2>✅ Allocation Successful!</h2>
    
    <div class="result-stats">
      <div class="stat-item">
        <span class="stat-label">Total Students:</span>
        <span class="stat-value">{{ allocationResult.totalStudents }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Seats Allocated:</span>
        <span class="stat-value">{{ allocationResult.allocated }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Rooms Used:</span>
        <span class="stat-value">{{ allocationResult.roomsUsed }}</span>
      </div>
      <div class="stat-item" *ngIf="allocationResult.excluded > 0">
        <span class="stat-label">Excluded (Detained):</span>
        <span class="stat-value">{{ allocationResult.excluded }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Spacing:</span>
        <span class="stat-value">{{ allocationResult.spacing }} seat(s)</span>
      </div>
    </div>

    <div class="result-actions">
      <button class="btn btn-primary" (click)="viewChart()">
        📊 View Seating Chart
      </button>
      <button class="btn btn-secondary" (click)="router.navigate(['/seating-manager/hall-tickets'])">
        🎫 Generate Hall Tickets
      </button>
    </div>
  </div>
</div>
```

### SCSS (seat-allocation.component.scss)

```scss
.allocation-container {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
  }
}

.card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1.5rem 0;
    color: var(--text-primary);
  }
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  select, input[type="text"], input[type="number"] {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  small {
    display: block;
    margin-top: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;

    input[type="checkbox"] {
      width: auto;
      cursor: pointer;
    }

    span {
      font-weight: 500;
    }
  }
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;

  &.btn-lg {
    padding: 1rem 2rem;
    font-size: 1.1rem;
  }

  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &.btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);

    &:hover:not(:disabled) {
      background: var(--border-color);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.result-card {
  &.success {
    border-left: 4px solid #10b981;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
  }

  .result-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;

    .stat-item {
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: 8px;
      border: 1px solid var(--border-color);

      .stat-label {
        display: block;
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
      }

      .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary-color);
      }
    }
  }

  .result-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .allocation-container {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }

  .result-stats {
    grid-template-columns: 1fr !important;
  }

  .result-actions {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }
}
```

---

## Next: Hall Ticket Generation & Seating Chart Components

The remaining components follow similar patterns. Would you like me to:
1. Create the complete files for all components
2. Or provide them in the documentation format?

All components are designed to work with the backend API endpoints we created.
