import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private url: string = 'http://localhost:3090';

  constructor(){
    this.socket = io(this.url)
  }

  sendEvent(e: string, data: any){
    this.socket.emit(e, data);
  }

  listenEvent(e: string): Observable<any>{
    return new Observable(obs => {
      this.socket.on(e, (data)=>{
        obs.next(data);
      })
    })
  }

  disconnect(){
    this.socket.disconnect();
  }
}
