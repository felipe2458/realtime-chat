import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserData } from '../../interface/interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:3090/api/users';

  createUser(userData: UserData){
    return this.http.post(`${this.apiUrl}`, userData, { observe: 'response' });
  }

  login(userData: UserData){
    return this.http.post(`${this.apiUrl}/login`, userData, { observe: 'response' });
  }
}
