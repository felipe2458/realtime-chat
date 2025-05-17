import { Component } from '@angular/core';
import { UserService } from '../../../../services/user/user.service';

@Component({
  selector: 'app-find-users',
  imports: [],
  templateUrl: './find-users.component.html',
  styleUrl: './find-users.component.css'
})
export class FindUsersComponent {
  users: {username: string}[] = [];

  constructor(private userService: UserService){
    this.userService.getAllUsers().subscribe(res => {
      this.users = (res.body as { username: string }[]);
    });
  }
}
