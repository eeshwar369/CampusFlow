import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { SeatingAllocationComponent } from './seating-allocation/seating-allocation.component';
import { BulkUploadComponent } from './bulk-upload/bulk-upload.component';
import { EventManagementComponent } from './event-management/event-management.component';
import { ManageStudentsComponent } from './manage-students/manage-students.component';
import { ManageCoursesComponent } from './manage-courses/manage-courses.component';
import { ApprovePaymentsComponent } from './approve-payments/approve-payments.component';
import { ApproveHallTicketsComponent } from './approve-hall-tickets/approve-hall-tickets.component';
import { PublishNotificationsComponent } from './publish-notifications/publish-notifications.component';
import { GenerateReportsComponent } from './generate-reports/generate-reports.component';
import { ApproveEventsComponent } from './approve-events/approve-events.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'students', component: ManageStudentsComponent },
  { path: 'courses', component: ManageCoursesComponent },
  { path: 'payments', component: ApprovePaymentsComponent },
  { path: 'hall-tickets', component: ApproveHallTicketsComponent },
  { path: 'notifications', component: PublishNotificationsComponent },
  { path: 'reports', component: GenerateReportsComponent },
  { path: 'seating', component: SeatingAllocationComponent },
  { path: 'bulk-upload', component: BulkUploadComponent },
  { path: 'events', component: EventManagementComponent },
  { path: 'approve-events', component: ApproveEventsComponent }
];

@NgModule({
  declarations: [
    AdminDashboardComponent,
    SeatingAllocationComponent,
    BulkUploadComponent,
    EventManagementComponent,
    ManageStudentsComponent,
    ManageCoursesComponent,
    ApprovePaymentsComponent,
    ApproveHallTicketsComponent,
    PublishNotificationsComponent,
    GenerateReportsComponent,
    ApproveEventsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }
