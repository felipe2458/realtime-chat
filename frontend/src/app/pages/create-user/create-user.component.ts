import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-user',
  imports: [FormsModule],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent {
  constructor(private userService: UserService, private router: Router) { }

  username: string = '';
  password: string = '';
  confirmPassword: string = '';

  enviInfos(e: Event){
    if(this.username.trim().length < 6){
      alert('Username must be at least 10 characters long');
      e.preventDefault();
      return;
    }

    if(this.password.trim().length < 8){
      alert('Password must be at least 8 characters long');
      e.preventDefault();
      return;
    }

    if(this.password !== this.confirmPassword){
      alert('Passwords do not match');
      e.preventDefault();
      return;
    }

    this.userService.createUser({ username: this.username, password: this.password }).subscribe({
      next: (res)=>{
        this.router.navigate(['/login']);
      },
      error: (err)=>{
        if(err.status === 400) alert('User already exists');
      }
    });
  }
}
