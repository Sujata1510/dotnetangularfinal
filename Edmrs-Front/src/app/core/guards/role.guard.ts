// import { inject } from '@angular/core';
// import { Router, CanActivateFn } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// export const roleGuard: CanActivateFn = (route) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // 1. Check if token exists and isn't expired
//   if (!authService.isAuthenticated()) {
//     router.navigate(['/login']);
//     return false;
//   }

//   // 2. Read permitted roles for this route from app.routes.ts
//   const allowedRoles = route.data['roles'] as Array<string>;
//   const user = authService.currentUser();

//   // 3. Verify user's token contains at least one allowed role
//   if (user && user.roles.some((role) => allowedRoles.includes(role))) {
//     return true; // Access granted
//   }

//   // 4. Access denied: Redirect user to their own valid dashboard
//   if (user) {
//     authService.redirectUserByRole(user.roles);
//   } else {
//     router.navigate(['/login']);
//   }
  
//   return false;
// };
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  // 1. Get required roles defined on the route
  const expectedRoles: string[] = route.data['roles'] || [];

  // 2. Get active user's role from JWT token
  const userRole = authService.userRoles();
  const normalizedUserRole = userRole.toLowerCase().trim();

  // 3. Check if user's role matches any allowed role for this route
  const hasAccess = expectedRoles.some(
    (role) => role.toLowerCase().trim() === normalizedUserRole
  );

  if (hasAccess) {
    return true; // Role matches, grant route entry
  }

  // 4. Fallback redirection if user attempts unauthorized access
  console.warn(`Access Denied: User role [${userRole}] cannot access ${state.url}`);

  switch (normalizedUserRole) {
    case 'admin':
      return router.createUrlTree(['/admin-dashboard']);
    case 'manager':
      return router.createUrlTree(['/manager-dashboard']);
    case 'viewer':
    default:
      return router.createUrlTree(['/viewer-dashboard']);
  }
};