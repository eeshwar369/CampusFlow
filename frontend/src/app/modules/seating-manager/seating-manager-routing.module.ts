import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeatingManagerDashboardComponent } from './seating-manager-dashboard/seating-manager-dashboard.component';
import { SeatAllocationComponent } from './seat-allocation/seat-allocation.component';
import { HallTicketGenerationComponent } from './hall-ticket-generation/hall-ticket-generation.component';
import { SeatingChartComponent } from './seating-chart/seating-chart.component';
import { ExamManagementComponent } from './exam-management/exam-management.component';

const routes: Routes = [
  {
    path: '',
    component: SeatingManagerDashboardComponent
  },
  {
    path: 'exams',
    component: ExamManagementComponent
  },
  {
    path: 'allocate',
    component: SeatAllocationComponent
  },
  {
    path: 'hall-tickets',
    component: HallTicketGenerationComponent
  },
  {
    path: 'chart/:examId',
    component: SeatingChartComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeatingManagerRoutingModule { }
