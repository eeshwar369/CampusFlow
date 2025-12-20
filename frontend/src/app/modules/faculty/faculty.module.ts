import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { FacultyDashboardComponent } from './faculty-dashboard/faculty-dashboard.component';
import { CourseMaterialsComponent } from './course-materials/course-materials.component';
import { AssignmentsComponent } from './assignments/assignments.component';
import { AssignmentGradingComponent } from './assignment-grading/assignment-grading.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: FacultyDashboardComponent },
  { path: 'courses/:id/materials', component: CourseMaterialsComponent },
  { path: 'courses/:id/assignments', component: AssignmentsComponent },
  { path: 'assignments/:id/grading', component: AssignmentGradingComponent }
];

@NgModule({
  declarations: [
    FacultyDashboardComponent,
    CourseMaterialsComponent,
    AssignmentsComponent,
    AssignmentGradingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class FacultyModule { }
