import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import axios from 'axios';
import { ServerService } from 'src/app/server.service';
import Response from 'src/response.model';
import { Router } from '@angular/router';
import { SphereService } from '../sphere.service';
import { AuthService } from 'src/app/auth.service';
import { SphereComponent } from '../sphere/sphere.component';
import { NgIf } from '@angular/common';
import { NotificationComponent } from '../notification/notification.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [SphereComponent, NgIf, NotificationComponent],
  standalone: true,
})
export class RegisterComponent implements AfterViewInit {
  @ViewChild('username') NameElement!: ElementRef<HTMLInputElement>;
  @ViewChild('passwd') PasswordElement!: ElementRef<HTMLInputElement>;
  @ViewChild('email') EmailElement!: ElementRef<HTMLInputElement>;

  public constructor(
    private authService: AuthService,
    private sphereService: SphereService
  ) {}

  ngAfterViewInit(): void {
    this.sphereService.render();
  }

  public nameValid = true;
  public passValid = true;
  public emailValid = true;
  public univValid = true;
  public nameUnique = true;
  public emailUnique = true;

  checkUser() {
    this.nameUnique = true;
    const content = this.NameElement.nativeElement.value;
    if (content.length < 6) {
      this.nameValid = false;
    } else {
      this.nameValid = true;
    }
  }

  checkPassword() {
    const content = this.PasswordElement.nativeElement.value;
    // includes at least 1 number, 1 upper and 1 lower.
    // and must be at least 6 chars long
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;
    if (!regex.test(content)) {
      this.passValid = false;
    } else {
      this.passValid = true;
    }
  }

  checkEmail() {
    this.emailUnique = true;
    const content = this.EmailElement.nativeElement.value;
    if (!content.length) {
      this.emailValid = true;
      return;
    }
    // eslint-disable-next-line no-useless-escape
    const regex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z.]+$/;
    if (!regex.test(content)) {
      this.emailValid = false;
    } else {
      this.emailValid = true;
    }
  }

  async signUp() {
    this.checkEmail();
    this.checkPassword();
    this.checkUser();
    if (
      !this.nameValid ||
      !this.passValid ||
      !this.emailValid ||
      !this.univValid
    ) {
      return;
    }
    const resp = await axios.post(ServerService.UserServer + '/user/register', {
      name: this.NameElement.nativeElement.value,
      password: this.PasswordElement.nativeElement.value,
      email: this.EmailElement.nativeElement.value,
    });
    const data: Response<string> = resp.data;
    if (data.code == 400) {
      this.nameUnique = false;
    } else if (data.code == 401) {
      this.emailUnique = false;
    } else if (data.code == 200) {
      // store the user info in local storage
      this.authService.setToken(data.data);
      window.location.pathname = '/after';
    }
  }

  public gotoLogin() {
    window.location.pathname = '/login';
  }
}
