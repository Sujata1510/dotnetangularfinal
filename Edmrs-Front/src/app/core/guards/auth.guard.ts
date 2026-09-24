import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const expectedRoles = (route.data['roles'] as Array<string>) || [];

    if (expectedRoles && expectedRoles.length > 0) {
      const userRoles = authService.userRoles().map((r) => r.toLowerCase().trim());
      const hasRole = expectedRoles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        authService.redirectUserByRole();
        return false;
      }
    }
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};