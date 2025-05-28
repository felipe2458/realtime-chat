import { AlertService } from './../../services/alert/alert.service';
import { Component, HostListener } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { Links } from '../../interface/interface';
import { GetInfosFrontService } from '../../services/getinfos-front/get-infos-front.service';
import { SocketService } from '../../services/socket/socket.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  name: string = '';
  isAsideOpen: boolean = true;
  recents_chats: any[] = [];
  links: Links[] = [];
  alertMessage: string | null = null;

  constructor(private getInfosFrontService: GetInfosFrontService, private socketService: SocketService, private alertService: AlertService){
    this.alertService.alert$.subscribe(msg => {
      this.alertMessage = msg;

      setTimeout(()=>{
        this.alertMessage = null;
      }, 3000);
    });

    this.getInfosFrontService.getLinks().subscribe(links => {
      this.links = links;
    });

    const token = localStorage.getItem('token');
    const isAsideOpen = localStorage.getItem('isAsideOpen');

    if(token){
      const decoded: any = jwtDecode(token);
      this.name = decoded.username;
    }

    if(isAsideOpen){
      this.isAsideOpen = JSON.parse(isAsideOpen);
    }

    this.socketService.sendEvent('username', this.name);

    this.socketService.listenEvent('friendRequestReceived').subscribe();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyBoardEvent(e: KeyboardEvent){
    if(e.ctrlKey && e.key === 'b'){
      e.preventDefault();
      this.openAside();
    }
  }

  openAside(){
    this.isAsideOpen = !this.isAsideOpen;

    localStorage.setItem('isAsideOpen', JSON.stringify(this.isAsideOpen));
  }

  closeAlert(){
    this.alertService.clear();
  }
}
