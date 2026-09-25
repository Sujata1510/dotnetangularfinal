import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (state.url.includes('/login')) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    authService.clearSession();
    return router.createUrlTree(['/login']);
  }

  const expectedRoles = (route.data['roles'] as string[] | undefined) ?? [];
  if (expectedRoles.length === 0) {
    return true;
  }

  const userRoles = authService.userRoles().map((role) => role.toLowerCase());
  const hasRole = expectedRoles.some((role) => userRoles.includes(role.toLowerCase()));
  if (hasRole) {
    return true;
  }

  const home = authService.homeRouteForCurrentUser();
  const current = state.url.split('?')[0];
  if (current === home) {
    return true;
  }

  return router.createUrlTree([home]);
};
