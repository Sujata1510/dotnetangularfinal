import { CanActivateFn } from '@angular/router';
import { authGuard } from './auth.guard';

/** Role checks live on authGuard via route data. This alias keeps older imports compiling. */
export const roleGuard: CanActivateFn = (route, state) => authGuard(route, state);
