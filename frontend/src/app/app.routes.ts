import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Auth
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(c => c.RegisterComponent) },

  // Admin
  { path: 'admin', canActivate: [roleGuard], data: { role: 'admin' }, children: [
    { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(c => c.DashboardComponent) },
    { path: 'coaches', loadComponent: () => import('./features/admin/coaches/coaches.component').then(c => c.CoachesComponent) },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  ]},

  // Coach
  { path: 'coach', canActivate: [roleGuard], data: { role: 'coach' }, children: [
    { path: 'dashboard', loadComponent: () => import('./features/coach/coach-dashboard/coach-dashboard.component').then(c => c.CoachDashboardComponent) },
    { path: 'members/:id', loadComponent: () => import('./features/coach/member-detail/member-detail.component').then(c => c.MemberDetailComponent) },
    { path: 'routines', loadComponent: () => import('./features/coach/routines/routines.component').then(c => c.RoutinesComponent) },
    { path: 'routines/create', loadComponent: () => import('./features/coach/routine-create/routine-create.component').then(c => c.RoutineCreateComponent) },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  ]},

  // Member
  { path: 'member', canActivate: [roleGuard], data: { role: 'member' }, children: [
    { path: 'routine', loadComponent: () => import('./features/member/member-routine/member-routine.component').then(c => c.MemberRoutineComponent) },
    { path: 'feedback', loadComponent: () => import('./features/member/member-feedback/member-feedback.component').then(c => c.MemberFeedbackComponent) },
    { path: 'progress', loadComponent: () => import('./features/member/member-progress/member-progress.component').then(c => c.MemberProgressComponent) },
    { path: 'notifications', loadComponent: () => import('./features/member/member-notifications/member-notifications.component').then(c => c.MemberNotificationsComponent) },
    { path: '', redirectTo: 'routine', pathMatch: 'full' },
  ]},
];
