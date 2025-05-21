import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private userService: UserService, private router: Router){}

  username: string = '';
  password: string = '';

  async enviInfos(e: Event){
    e.preventDefault();

    if(this.username.trim() === '' || this.password.trim() === ''){
      alert('Please fill in all fields');
      return;
    }

    try{
      const res = await this.userService.login({ username: this.username, password: this.password }).toPromise();
      const body = res?.body as { token?: string };

      if(res && res.status === 200 && body.token){
        localStorage.setItem('token', body.token);
        this.router.navigate(['/home']);
      }
    }catch(err: any){
      if(err.status === 404){
        alert('User not found');
        return;
      }

      if(err.status === 401){
        alert('Password incorrect');
      }
    }
  }
}
