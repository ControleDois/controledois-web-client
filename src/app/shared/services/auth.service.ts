import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { User } from '../interfaces/user.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private resource = 'auth';

  constructor (
    private apiService: ApiService
  ) {
  }

  register(user: User): Observable<any> {
    return this.apiService.on(`${this.resource}/signup`, {
      name: user.name,
      email: user.email,
      password: user.password
    }, 'post');
  }

  login(user: User): Observable<any> {
    return this.apiService.on(`${this.resource}/signin`, {
      email: user.email,
      password: user.password
    }, 'post');
  }

  recover(user: User): Observable<any> {
    return this.apiService.on(`${this.resource}/recover`, {
      email: user.email,
    }, 'post');
  }
}
