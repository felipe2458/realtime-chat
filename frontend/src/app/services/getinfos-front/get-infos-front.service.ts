import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Links } from '../../interface/interface';

@Injectable({
  providedIn: 'root'
})
export class GetInfosFrontService {
  constructor(private http: HttpClient) { }

  getLinks(): Observable<Links[]>{
    return this.http.get<Links[]>('json/links.json');
  }
}
