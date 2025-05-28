import { UserService } from './../../../../services/user/user.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserDB } from '../../../../interface/interface';
import { jwtDecode } from 'jwt-decode';
import { SocketService } from '../../../../services/socket/socket.service';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../services/alert/alert.service';

@Component({
  selector: 'app-friend-requests',
  imports: [FormsModule, CommonModule],
  templateUrl: './friend-requests.component.html',
  styleUrl: './friend-requests.component.css'
})
export class FriendRequestsComponent {
  search: string = '';
  userLogged: UserDB = {} as UserDB;
  pendingFriendshipsReceived: UserDB[] = [];
  pendingFriendShipReceivedCopy: UserDB[] = [];

  constructor(private userService: UserService, private socketService: SocketService, private alertService: AlertService){
    this.userService.getAllUsers().subscribe(res => {
      this.userLogged = (res.body as UserDB[]).filter(user => user.username === this.userService.user.username)[0];

      const ordersReceived: string[] = this.userLogged.pendingFriendshipsReceived.map(user => user.username);

      ordersReceived.forEach(username => {
        this.pendingFriendshipsReceived.push((res.body as UserDB[]).filter(user => user.username === username)[0]);
        this.pendingFriendShipReceivedCopy = this.pendingFriendshipsReceived;
      })

      this.pendingFriendshipsReceived = this.pendingFriendshipsReceived.slice(0, 12);

      this.socketService.listenEvent('friendRequestReceived').subscribe((res: { to: UserDB, from: UserDB, wasSentFriendRequest: boolean }) => {
        if(res.wasSentFriendRequest){
          this.pendingFriendshipsReceived.push(res.from);
          return;
        }

        const index = this.userLogged.pendingFriendshipsReceived.findIndex(u => u.username === res.from.username);

        this.userLogged.pendingFriendshipsReceived.splice(index, 1);
      });
    })
  }

  filterRequests(){
    if(this.search === ''){
      this.pendingFriendshipsReceived = this.pendingFriendShipReceivedCopy.slice(0, 12);
      return;
    }

    this.pendingFriendshipsReceived = this.pendingFriendShipReceivedCopy.filter(user => {
      return user.username.toLowerCase().includes(this.search.toLowerCase())
    }).slice(0, 12);
  }

  acceptFriendRequest(user: UserDB){
    this.userService.acceptFriendRequest(user.username).subscribe({
      next: (res) => {
        this.alertService.show(res.body?.message || 'Friend request accepted successfully!');
        this.pendingFriendshipsReceived = this.pendingFriendshipsReceived.filter(u => u.username !== user.username);
        this.pendingFriendShipReceivedCopy = this.pendingFriendshipsReceived;
        this.socketService.sendEvent('friendRequestAccepted', { to: user, from: this.userLogged });
      },
      error: (err)=>{
        this.alertService.show(err.error.message);

        if(err.status === 401){
          console.log(user.username)
          this.socketService.sendEvent('removeFriendRequest', { to: user, from: this.userLogged, isErro: true });
          this.pendingFriendshipsReceived = this.pendingFriendshipsReceived.filter(u => u.username !== user.username);
          this.pendingFriendShipReceivedCopy = this.pendingFriendshipsReceived;
          return;
        }
      }
    })
  }

  rejectFriendRequest(user: UserDB){
    this.userService.rejectFriendRequest(user.username).subscribe({
      next: (res)=>{
        this.alertService.show(res.body?.message || 'Friend request rejected successfully!');
        this.pendingFriendshipsReceived = this.pendingFriendshipsReceived.filter(u => u.username !== user.username);
        this.pendingFriendShipReceivedCopy = this.pendingFriendshipsReceived;
        this.socketService.sendEvent('removeFriendRequest', { to: user, from: this.userLogged, isErro: false });
      }
    })
  }
}
