import { UserService } from './../../../../services/user/user.service';
import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserDB, UserDBOptions } from '../../../../interface/interface';
import { AlertService } from '../../../../services/alert/alert.service';
import { SocketService } from '../../../../services/socket/socket.service';

@Component({
  selector: 'app-friends-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './friends-list.component.html',
  styleUrl: './friends-list.component.css'
})
export class FriendsListComponent {
  @ViewChild('optionsRef') optionsRef!: ElementRef;
  search: string = '';
  userLogged: UserDB = {} as UserDB;
  friendsList: UserDBOptions[] = [];
  friendsListCopy: UserDBOptions[] = [];

  constructor(private userService: UserService, private alertService: AlertService, private socketService: SocketService){
    this.userService.getAllUsers().subscribe(res => {
      const users = (res.body as UserDBOptions[]).filter(u => u.username !== this.userService.user.username);

      this.userLogged = (res.body as UserDBOptions[]).find(user => user.username === this.userService.user.username) || {} as UserDBOptions;

      this.friendsListCopy = users.filter(user => this.userLogged.friends.some(friend => friend.username === user.username));

      this.friendsList = this.friendsListCopy.slice(0, 12);
      this.friendsList = this.friendsList.map(user => {
        return {
          ...user,
          isOnline: false
        };
      })
    });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(e: MouseEvent){
    const clikedInside = this.optionsRef?.nativeElement.contains(e.target);

    if(!clikedInside) this.friendsList.forEach(friend => friend.options = false);
  }

  toggleOptions(e: MouseEvent, friend: UserDBOptions){
    e.stopPropagation();
    const alreadOpen = friend.options;
    this.friendsList.forEach(friend => friend.options = false);
    friend.options = !alreadOpen;
  }

  filterUsers(){
    if(this.search === ''){
      this.friendsList = this.friendsListCopy.slice(0, 12);
      this.friendsList = this.friendsList.map(user => {
        return {
          ...user,
          isOnline: false
        };
      })
      return;
    }

    this.friendsList = this.friendsListCopy.filter(user => {
      return user.username.toLowerCase().includes(this.search.toLowerCase())
    }).slice(0, 12);
  }

  removeFriend(user: UserDBOptions){
    this.friendsList.forEach(friend => friend.options = false);

    this.userService.removeFriend(user.username).subscribe({
      next: ()=>{
        this.alertService.show('Friend removed successfully!');
        this.socketService.sendEvent('removeFriend', { to: user, from: this.userLogged });
        this.friendsList = this.friendsListCopy.filter(u => u.username !== user.username);
      },
      error: (err)=>{
        this.alertService.show(err.error.message);
      }
    })
  }
}
