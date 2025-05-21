import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { map, take, tap } from 'rxjs/operators';

export const authdGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLogged().pipe(
    take(1),
    tap(val => console.log('isLogged:', val)),
    map(isLogged => isLogged ? true : router.createUrlTree(['/login']))
  );
};
