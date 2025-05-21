import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../user/user.service';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private userService: UserService) {}

  isLogged(): Observable<boolean> {
    const token = localStorage.getItem('token') || '';

    if (!token) return of(false);

    try {
      const decoded: { username: string, exp: number } = jwtDecode(token);

      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        localStorage.removeItem('token');
        return of(false);
      }

      return this.userService.getAllUsers().pipe(
        take(1),
        map(() => true),
        catchError(() => {
          localStorage.removeItem('token');
          return of(false);
        })
      );

    } catch (err: any) {
      localStorage.removeItem('token');
      return of(false);
    }
  }
}
