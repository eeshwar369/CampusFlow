import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { HallTicketsComponent } from './hall-tickets/hall-tickets.component';
import { MindmapComponent } from './mindmap/mindmap.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: StudentDashboardComponent },
  { path: 'hall-tickets', component: HallTicketsComponent },
  { path: 'mindmap', component: MindmapComponent }
];

@NgModule({
  declarations: [
    StudentDashboardComponent,
    HallTicketsComponent,
    MindmapComponent
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
