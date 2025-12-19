import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ClubDashboardComponent } from './club-dashboard/club-dashboard.component';
import { EventManagementComponent } from './event-management/event-management.component';
import { MembersComponent } from './members/members.component';
import { ApproveParticipationsComponent } from './approve-participations/approve-participations.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ClubDashboardComponent },
  { path: 'events', component: EventManagementComponent },
  { path: 'members', component: MembersComponent },
  { path: 'approve-participations', component: ApproveParticipationsComponent }
];

@NgModule({
  declarations: [
    ClubDashboardComponent,
    EventManagementComponent,
    MembersComponent,
    ApproveParticipationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ClubModule { }
