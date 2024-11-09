import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouteReuseStrategy, Router } from '@angular/router';
import { SphereService } from '../sphere.service';
import axios from 'axios';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServerService } from 'src/app/server.service';
import Response from 'src/response.model';
import { AuthService } from 'src/app/auth.service';
import { SphereComponent } from '../sphere/sphere.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [SphereComponent, NgIf],
    standalone: true,
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('username') NameElement!: ElementRef<HTMLInputElement>;
  @ViewChild('passwd') PasswordElement!: ElementRef<HTMLInputElement>;

  nameValid = true;
  passValid = true;

  public constructor(
    private sphereService: SphereService,
    private snack: MatSnackBar,
    private authService: AuthService,
    ) {}

  checkName() {
    const content = this.NameElement.nativeElement.value;
    if (content.length) {
      this.nameValid = true;
    } else {
      this.nameValid = false;
    }
  }

  checkPwd() {
    const content = this.PasswordElement.nativeElement.value;
    if (content.length) {
      this.passValid = true;
    } else {
      this.passValid = false;
    }
  }

  ngAfterViewInit(): void {
    this.sphereService.render();
  }

  async signIn() {
    this.checkName();
    this.checkPwd();
    if (!this.nameValid || !this.passValid) {
      return;
    }
    const resp = await axios.post(ServerService.UserServer + '/user/login', {
      name: this.NameElement.nativeElement.value,
      password: this.PasswordElement.nativeElement.value,
    });
    const data: Response<string> = resp.data;
    if (data.code == 200) {
      this.authService.setToken(data.data);
      window.location.pathname = '/';
    } else if (data.code == 400){
      this.snack.open('Wrong user name or password.', 'Close', {
        duration: 5000,
      });
    }
  }

  public gotoReg() {
    window.location.pathname = '/register';
  }
}
