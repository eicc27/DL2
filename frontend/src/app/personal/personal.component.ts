import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import axios from 'axios';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';
import Paper from '../paper/paper.model';
import Recommendation, { SortedRecommendation } from './Recommendation.model';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss'],
})
export class PersonalComponent {
  private authorized = this.authService.isAuthenticated();
  public name = this.authService.getToken()?.name;
  public recents: Paper[] = [];
  public favs: Paper[] = [];
  public recommends: Paper[] = [];

  public constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    if (!this.authorized) window.location.href = '/login';
    await this.getRecent();
    await this.getRecommends();
  }

  private async getRecent() {
    const resp = await axios.post(ServerService.LoginServer + '/user/recent', {
      jwt: localStorage.getItem('access_token'),
    });
    const data: GenericResponse<any> = resp.data;
    if (data.code !== 200) {
      window.location.href = '/login';
      return;
    }
    this.recents = data.data.recent;
    this.favs = data.data.favourite;
  }

  private async getRecommends() {
    const arxivIds = this.recents.map((paper) => paper.arxivId);
    const resp = await axios.post(
      ServerService.N4JServer + '/paper/nearbyPaper',
      {
        arxivId: arxivIds,
      }
    );
    const data: GenericResponse<Recommendation> = resp.data;
    let sortedRecommendations: SortedRecommendation[] = [];
    data.data.arxivId.forEach((arxivId, i) => {
      sortedRecommendations.push({
        arxivId,
        citations: data.data.citations[i],
      });
    });
    // sort by citations descending
    sortedRecommendations = sortedRecommendations
      .sort((a, b) => b.citations - a.citations)
      .slice(0, 5);
    const paperResp = await axios.post(
      ServerService.LoginServer + '/paper/papers',
      {
        arxivId: sortedRecommendations.map(
          (recommendation) => recommendation.arxivId
        ),
      }
    );
    const paperData: GenericResponse<Paper[]> = paperResp.data;
    this.recommends = paperData.data;
  }
  gotoSelect(){
    this.router.navigate(['/after']);
  }
  gotoMain() {
    window.location.href = '/';
  }
}
