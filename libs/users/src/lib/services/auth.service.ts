import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/User';
import { LocalStorageService } from './localStorage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiURL = 'http://localhost:3000/api/v1/users';

  constructor(private http: HttpClient, private token: LocalStorageService, private router: Router) { }

  login (email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiURL}/login`, {email: email, password: password});
  }

  logout () {
    this.token.removeToken();
    this.router.navigate(['/login']);
  }
}
