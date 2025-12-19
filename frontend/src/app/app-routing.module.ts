import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // Protected routes will be added here
  // { path: 'student', loadChildren: () => import('./modules/student/student.module').then(m => m.StudentModule), canActivate: [AuthGuard], data: { roles: ['student'] } },
  // { path: 'admin', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule), canActivate: [AuthGuard], data: { roles: ['admin'] } },
  // { path: 'seating', loadChildren: () => import('./modules/seating/seating.module').then(m => m.SeatingModule), canActivate: [AuthGuard], data: { roles: ['seating_manager'] } },
  // { path: 'club', loadChildren: () => import('./modules/club/club.module').then(m => m.ClubModule), canActivate: [AuthGuard], data: { roles: ['club_coordinator'] } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
