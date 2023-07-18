import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(public jwtHelper: JwtHelperService) { }

  public isAuthenticated() {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    return !this.jwtHelper.isTokenExpired(token);
  }

  public setToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  public getToken() {
    if (!this.isAuthenticated()) return;
    const token = localStorage.getItem('access_token')!;
    return {
      name: this.jwtHelper.decodeToken(token).name,
      email: this.jwtHelper.decodeToken(token).email,
    };
  }
}
