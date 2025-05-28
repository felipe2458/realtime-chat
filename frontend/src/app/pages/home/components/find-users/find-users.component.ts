import { Component } from '@angular/core';
import { UserService } from '../../../../services/user/user.service';
import { jwtDecode } from 'jwt-decode';
import { FormsModule } from '@angular/forms';
import { UserDB } from '../../../../interface/interface';
import { SocketService } from '../../../../services/socket/socket.service';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../services/alert/alert.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-find-users',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './find-users.component.html',
  styleUrl: './find-users.component.css'
})
export class FindUsersComponent {
  users: UserDB[] = [];
  userLogged!: UserDB;
  usersFiltered: UserDB[] = [];
  search: string = '';
  pendingFriendshipsSent: string[] = [];
  pendingFriendshipsReceived: string[] = [];
  friends: string[] = [];
  friendRequestsDeclinedSent: string[] = [];
  friendRemoved: string[] = [];
  removedByFriend: string[] = [];

  constructor(private userService: UserService, private socketService: SocketService, private alertService: AlertService){
    this.userService.getAllUsers().subscribe(res => {
      this.users = (res.body as UserDB[]).filter(user => user.username !== this.userService.user.username);
      this.userLogged = (res.body as UserDB[]).filter(user => user.username === this.userService.user.username)[0];

      this.pendingFriendshipsSent = this.userLogged.pendingFriendshipsSent.map(user => user.username);
      this.pendingFriendshipsReceived = this.userLogged.pendingFriendshipsReceived.map(user => user.username);

      this.friends = this.userLogged.friends.map(user => user.username);

      this.friendRequestsDeclinedSent = this.userLogged.friendRequestsDeclined.sent.map(user => user.username);

      this.friendRemoved = this.userLogged.friendRemoved.map(user => user.username);

      this.removedByFriend = this.userLogged.removedByFriend.map(user => user.username);

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
          const isFriend = this.userLogged.friends.some(user => user.username === candidate.username);
          const isRemovedByFriend = this.userLogged.removedByFriend.some(user => user.username === candidate.username);
          const isFriendRemoved = this.userLogged.friendRemoved.some(user => user.username === candidate.username);

          if(!isInReceived && !isInSent && !isFriend && !isRemovedByFriend && !isFriendRemoved){
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

      this.socketService.listenEvent('removeFriendRequest').subscribe((res: { to: UserDB, from: UserDB, isErro: boolean })=>{
        if(res.isErro){
          this.pendingFriendshipsSent = this.pendingFriendshipsSent.filter(u => u !== res.from.username);
          return;
        }

        this.friendRequestsDeclinedSent.push(res.from.username);
        this.pendingFriendshipsSent = this.pendingFriendshipsSent.filter(u => u !== res.from.username);
      });

      this.socketService.listenEvent('friendRequestAccepted').subscribe((res: { to: UserDB, from: UserDB })=>{
        this.pendingFriendshipsSent = this.pendingFriendshipsSent.filter(u => u !== res.from.username);
        this.friends.push(res.from.username);
      });

      this.socketService.listenEvent('removeFriend').subscribe((res: { to: UserDB, from: UserDB })=>{
        this.friends = this.friends.filter(u => u !== res.from.username);
        this.removedByFriend.push(res.from.username);
      })
    });
  }

  getFriendRequestTitle(user: string): string{
    if(this.pendingFriendshipsReceived.includes(user)) return 'friend request received';
    if(this.pendingFriendshipsSent.includes(user)) return 'friend request sent';
    if(this.friendRequestsDeclinedSent.includes(user)) return 'friend request declined';
    if(this.friendRemoved.includes(user)) return 'You have removed this friend from your list';
    if(this.removedByFriend.includes(user)) return 'This friend removed you from their friends list';
    if(this.friends.includes(user)) return 'go to chat';
    return 'send friend request';
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
        this.alertService.show(err.error.message);
        this.pendingFriendshipsSent.splice(this.pendingFriendshipsSent.indexOf(userFriend.username), 1);
        this.socketService.sendEvent('friendRequestGET', { to: userFriend, from: this.userLogged, wasSentFriendRequest: false });
        this.alertService.show(err.error.message);
        this.userService.getAllUsers().subscribe(res => {
          this.pendingFriendshipsReceived = (res.body as UserDB[]).filter(user => user.username === this.userLogged.username)[0].pendingFriendshipsReceived.map(user => user.username);
        })
      }
    }
   });
  }
}
