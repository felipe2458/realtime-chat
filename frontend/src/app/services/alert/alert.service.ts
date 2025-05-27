import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<string | null>(null);
  alert$ = this.alertSubject.asObservable();

  show(message: string){
    this.alertSubject.next(message);
  }

  clear(){
    this.alertSubject.next(null);
  }
}
