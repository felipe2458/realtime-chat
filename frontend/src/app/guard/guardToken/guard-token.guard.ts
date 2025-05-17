import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../../services/user/user.service';
import { catchError, of, map } from 'rxjs';

export const guardTokenGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  const userService = inject(UserService);
  const router = inject(Router);

  if(token){
    try{
      const decoded: any = jwtDecode(token)

      if(decoded.exp && Date.now() >= decoded.exp * 1000){
        localStorage.removeItem('token');
        return router.createUrlTree(['/login']);
      }

      return userService.getAllUsers().pipe(
        map(() => true),
        catchError(()=>{
          localStorage.removeItem('token');
          return of(router.createUrlTree(['/login']));
        })
      )

    }catch(err){
      localStorage.removeItem('token');
      return router.createUrlTree(['/login']);
    }
  }
  return router.createUrlTree(['/login'])
};
