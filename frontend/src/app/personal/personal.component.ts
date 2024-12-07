import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import axios from 'axios';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';
import Paper from '../paper/paper.model';
import Recommendation, { SortedRecommendation } from './Recommendation.model';
import { TopbarComponent } from '../topbar/topbar.component';
import { PaperInfoComponent } from '../paper/paper-info/paper-info.component';
import { MatIconModule } from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss'],
  imports: [TopbarComponent, PaperInfoComponent, MatIconModule, NgIf],
  standalone: true,
})
export class PersonalComponent {
  private authorized = this.authService.isAuthenticated();
  public name = this.authService.getToken()?.name;
  public recents: Paper[] = [];
  public favs: Paper[] = [];
  public recommends: Paper[] = [];
  public new: Paper[] = [];

  public constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    if (!this.authorized) window.location.href = '/login';
    await this.getRecent();
    await this.getRecommends();
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
    this.recents = data.data.recent;
    this.favs = data.data.favourite;
    this.new = data.data.new;
  }

  private async getRecommends() {
    const arxivIds = this.favs.map((paper) => paper.arxivId);
    const resp = await axios.post('http://localhost:8093/predict', {
      user_favs: arxivIds,
    });
    const papersResp = await axios.post(
      ServerService.UserServer + '/paper/papers',
      {
        arxivIds: resp.data.result,
      }
    );
    this.recommends = papersResp.data.data;
  }
  gotoSelect() {
    this.router.navigate(['/after']);
  }
  gotoMain() {
    window.location.href = '/';
  }
}
