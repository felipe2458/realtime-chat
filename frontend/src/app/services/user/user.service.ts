import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserData } from '../../interface/interface';
import { HttpHeaders } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:3090/api/users';

  private get headers(){
    const token = localStorage.getItem('token');
    if(token){
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    return new HttpHeaders();
  }

  get user():{username: string}{
    const token = localStorage.getItem('token');
    if(token && token.split('.').length === 3){
      return jwtDecode(token);
    }
    return {username: ''};
  }

  createUser(userData: UserData){
    return this.http.post(`${this.apiUrl}`, userData, { observe: 'response' });
  }

  login(userData: UserData){
    return this.http.post(`${this.apiUrl}/login`, userData, { observe: 'response' });
  }

  getAllUsers(){
    return this.http.get(`${this.apiUrl}/`, { headers: this.headers, observe: 'response' });
  }

  sendFriendRequest(userFriend: string){
    return this.http.put(`${this.apiUrl}/send-friend-request`, { loggedInUser: this.user.username, userFriend }, { headers: this.headers, observe: 'response' });
  }

  cancelFriendRequest(userFriend: string){
    return this.http.put(`${this.apiUrl}/cancel-friend-request`, { loggedInUser: this.user.username, userFriend }, { headers: this.headers, observe: 'response' });
  }
}
