import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-userinfo',
  templateUrl: './userinfo.component.html',
  styleUrls: ['./userinfo.component.scss'],
})
export class UserinfoComponent {
  loggedIn = false;
  name = '';

  public constructor(private route: Router) {
    const user = localStorage.getItem('user');
    console.log(user);
    if (user) {
      this.loggedIn = true;
      this.name = user;
    }
  }

  public login() {
    this.route.navigate(['login']);
  }

  public logout() {
    localStorage.removeItem('user');
    this.loggedIn = false;
    this.route.navigate(['login']);
  }
}
