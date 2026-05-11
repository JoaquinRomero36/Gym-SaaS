import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();
  const requiredRole = route.data?.['role'];

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (requiredRole && user.role !== requiredRole) {
    router.navigate([`/${user.role}/dashboard`]);
    return false;
  }

  return true;
};
