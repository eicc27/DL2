import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

@Component({
    selector: 'app-userinfo',
    templateUrl: './userinfo.component.html',
    styleUrls: ['./userinfo.component.scss'],
    imports: [NgIf],
    standalone: true,
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

  public goHome() {
    window.location.pathname = '/home';
  }
}
