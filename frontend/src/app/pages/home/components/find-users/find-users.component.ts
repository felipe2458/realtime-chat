import { Component } from '@angular/core';
import { UserService } from '../../../../services/user/user.service';
import { jwtDecode } from 'jwt-decode';
import { FormsModule } from '@angular/forms';
import { UserDB } from '../../../../interface/interface';
import { SocketService } from '../../../../services/socket/socket.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-find-users',
  imports: [FormsModule, CommonModule],
  templateUrl: './find-users.component.html',
  styleUrl: './find-users.component.css'
})
export class FindUsersComponent {
  users: UserDB[] = [];
  userLogged!: UserDB;
  usersFiltered: UserDB[] = [];
  search: string = '';
  pendingFriendshipsSent: string[] = [];

  constructor(private userService: UserService, private socketService: SocketService){
    this.userService.getAllUsers().subscribe(res => {
      const token = localStorage.getItem('token') || '';
      const decoded: { username: string } = jwtDecode(token);

      this.users = (res.body as UserDB[]).filter(user => user.username !== decoded.username);
      this.userLogged = (res.body as UserDB[]).filter(user => user.username === decoded.username)[0];

      this.pendingFriendshipsSent = this.userLogged.pendingFriendshipsSent.map(user => user.username);

      const userCopy = [...this.users];
      this.usersFiltered = [];

      while(this.usersFiltered.length < 12 && userCopy.length > 0){
        let attemps = 0;
        const maxAttemps = userCopy.length * 2;
        let drawnUser: UserDB | undefined;

        while(attemps < maxAttemps){
          const drawNumber = Math.floor(Math.random() * userCopy.length);
          const candidate = userCopy[drawNumber];

          const isInReceived = this.userLogged.pendingFriendshipsReceived.some(user => user.username === candidate.username);
          const isInSent = this.userLogged.pendingFriendshipsSent.some(user => user.username === candidate.username);

          if(!isInReceived && !isInSent){
            drawnUser = candidate;
            userCopy.splice(drawNumber, 1);
            break;
          }

          attemps++;
        }

        if(!drawnUser){
          break;
        }

        this.usersFiltered.push(drawnUser);
      }
    });
  }

  filterUsers(){
    if(this.search.trim() === ''){
      const start = Math.floor(Math.random() * (this.users.length - 10 + 1));
      this.usersFiltered = this.users.slice(start, start + 12);
      return;
    }

    this.usersFiltered = this.users.filter(user => {
      return user.username.toLowerCase().includes(this.search.toLowerCase());
    }).slice(0, 10)
  }

  sendFriendRequest(userFriend: UserDB){
   this.userService.sendFriendRequest(userFriend.username).subscribe({
    next: ()=>{
      this.pendingFriendshipsSent.push(userFriend.username)
      this.socketService.sendEvent('friendRequestGET', { to: userFriend, from: this.userLogged, wasSentFriendRequest: true });
    },
    error: (err)=>{
      if(err.status === 400){
        this.pendingFriendshipsSent.splice(this.pendingFriendshipsSent.indexOf(userFriend.username), 1);
        this.userService.cancelFriendRequest(userFriend.username).subscribe();
        this.socketService.sendEvent('friendRequestGET', { to: userFriend, from: this.userLogged, wasSentFriendRequest: false });
        console.clear();
      }
    }
   });
  }
}
