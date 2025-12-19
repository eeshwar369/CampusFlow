import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'student', 
    loadChildren: () => import('./modules/student/student.module').then(m => m.StudentModule), 
    canActivate: [AuthGuard], 
    data: { roles: ['student'] } 
  },
  { 
    path: 'faculty', 
    loadChildren: () => import('./modules/faculty/faculty.module').then(m => m.FacultyModule), 
    canActivate: [AuthGuard], 
    data: { roles: ['faculty'] } 
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule), 
    canActivate: [AuthGuard], 
    data: { roles: ['admin'] } 
  },
  { 
    path: 'club', 
    loadChildren: () => import('./modules/club/club.module').then(m => m.ClubModule), 
    canActivate: [AuthGuard], 
    data: { roles: ['club_coordinator'] } 
  },
  { 
    path: 'seating-manager', 
    loadChildren: () => import('./modules/seating-manager/seating-manager.module').then(m => m.SeatingManagerModule), 
    canActivate: [AuthGuard], 
    data: { roles: ['seating_manager', 'admin'] } 
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
