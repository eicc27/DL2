import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';
import GenericResponse from 'src/app/GenericResponse.model';
import { AuthService } from 'src/app/auth.service';
import Paper from 'src/app/paper/paper.model';
import { ServerService } from 'src/app/server.service';

@Component({
    selector: 'app-fav',
    templateUrl: './fav.component.html',
    styleUrls: ['./fav.component.scss'],
    imports: [NgFor],
    standalone: true,
})
export class FavComponent {
  private authorized = this.authService.isAuthenticated();
  public name = this.authService.getToken()?.name;
  public favs: Paper[] = [];

  public constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (!this.authorized) window.location.href = '/login';
    await this.getRecent();
  }

  private async getRecent() {
    const resp = await axios.post(ServerService.UserServer + '/user/recent', {
      jwt: localStorage.getItem('access_token'),
    });
    const data: GenericResponse<any> = resp.data;
    if (data.code !== 200) {
      window.location.href = '/login';
      return;
    }
    this.favs = data.data.favourite;
  }

  
}
