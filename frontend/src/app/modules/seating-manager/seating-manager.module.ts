import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SeatingManagerRoutingModule } from './seating-manager-routing.module';
import { SeatingManagerDashboardComponent } from './seating-manager-dashboard/seating-manager-dashboard.component';
import { SeatAllocationComponent } from './seat-allocation/seat-allocation.component';
import { HallTicketGenerationComponent } from './hall-ticket-generation/hall-ticket-generation.component';
import { SeatingChartComponent } from './seating-chart/seating-chart.component';
import { ExamManagementComponent } from './exam-management/exam-management.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    SeatingManagerDashboardComponent,
    SeatAllocationComponent,
    HallTicketGenerationComponent,
    SeatingChartComponent,
    ExamManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SeatingManagerRoutingModule,
    SharedModule
  ]
})
export class SeatingManagerModule { }
