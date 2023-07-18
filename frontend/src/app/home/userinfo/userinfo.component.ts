import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-userinfo',
  templateUrl: './userinfo.component.html',
  styleUrls: ['./userinfo.component.scss'],
})
export class UserinfoComponent {
  loggedIn = false;
  name = '';

  public constructor(private route: Router, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getToken();
    if (user) {
      this.loggedIn = true;
      this.name = user.name;
    }
  }

  public login() {
    window.location.pathname = '/login';
  }

  public logout() {
    localStorage.removeItem('user');
    this.loggedIn = false;
    window.location.pathname = '/login';
  }
}
