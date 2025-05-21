import { UserService } from './../../../../services/user/user.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserDB } from '../../../../interface/interface';
import { jwtDecode } from 'jwt-decode';
import { SocketService } from '../../../../services/socket/socket.service';

@Component({
  selector: 'app-friend-requests',
  imports: [FormsModule],
  templateUrl: './friend-requests.component.html',
  styleUrl: './friend-requests.component.css'
})
export class FriendRequestsComponent {
  search: string = '';
  userLogged: UserDB = {
    id: 0,
    username: '',
    friends: [],
    pendingFriendshipsSent: [],
    pendingFriendshipsReceived: [],
    idSocket: '',
    icon: ''
  };

  constructor(private userService: UserService, private socketService: SocketService){
    this.userService.getAllUsers().subscribe(res => {
      const token = localStorage.getItem('token') || '';
      const decoded: { username: string } = jwtDecode(token);

      this.userLogged = (res.body as UserDB[]).filter(user => user.username === decoded.username)[0];

      this.socketService.listenEvent('friendRequestReceived').subscribe((res: { to: UserDB, from: UserDB, wasSentFriendRequest: boolean }) => {
        if(res.wasSentFriendRequest){
          this.userLogged.pendingFriendshipsReceived.push(res.from);
          return;
        }

        const index = this.userLogged.pendingFriendshipsReceived.findIndex(u => u.username === res.from.username);

        this.userLogged.pendingFriendshipsReceived.splice(index, 1);
      });
    })
  }

  filterRequests(){}
}
