import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserRole } from '../types';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const required = route.data?.['role'] as UserRole | undefined;
  const current = auth.role();

  if (required && current !== required) {
    router.navigate([`/${current}/dashboard`]);
    return false;
  }

  return true;
};
