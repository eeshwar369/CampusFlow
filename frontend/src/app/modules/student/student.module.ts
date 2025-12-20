import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { HallTicketsComponent } from './hall-tickets/hall-tickets.component';
import { MindmapComponent } from './mindmap/mindmap.component';
import { EventsComponent } from './events/events.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { CourseMaterialsComponent } from './course-materials/course-materials.component';
import { AssignmentsComponent } from './assignments/assignments.component';
import { AssignmentSubmitComponent } from './assignment-submit/assignment-submit.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: StudentDashboardComponent },
  { path: 'hall-tickets', component: HallTicketsComponent },
  { path: 'mindmap', component: MindmapComponent },
  { path: 'events', component: EventsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'materials', component: CourseMaterialsComponent },
  { path: 'assignments', component: AssignmentsComponent },
  { path: 'assignments/:id/submit', component: AssignmentSubmitComponent }
];

@NgModule({
  declarations: [
    StudentDashboardComponent,
    HallTicketsComponent,
    MindmapComponent,
    EventsComponent,
    NotificationsComponent,
    CourseMaterialsComponent,
    AssignmentsComponent,
    AssignmentSubmitComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class StudentModule { }
