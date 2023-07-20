import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Paper from './paper.model';
import axios from 'axios';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Recommendation, { SortedRecommendation } from '../personal/Recommendation.model';

@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss'],
})
export class PaperComponent implements OnInit {
  public id!: string;
  public paper!: Paper;
  public loading = false;
  public fav = false;
  public relatedPapers: Paper[] = [];
  public authorized = this.authService.isAuthenticated();
  @ViewChild('title')
  public titleElement!: ElementRef<HTMLHeadElement>;

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  private async getFav() {
    const res = await axios.post<GenericResponse<boolean>>(
      ServerService.LoginServer + `/user/get_favourite`,
      {
        jwt: localStorage.getItem('access_token'),
        paperId: this.id,
      }
    );
    if (res.data.code !== 200) {
      return;
    }
    this.fav = res.data.data;
  }

  public ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.id = params['id'];
      await Promise.all([this.getFav(), this.getPaper()]);
      const maxNumTasks = Math.max(...this.paper.tasks.numPapers);
      const minNumTasks = Math.min(...this.paper.tasks.numPapers);
      const maxNumMethods = Math.max(...this.paper.methods.numPapers);
      const minNumMethods = Math.min(...this.paper.methods.numPapers);
      // linearly map the number of papers from color(#FF4500) into color(#1E90FF)
      this.paper.taskColors = this.paper.tasks.numPapers.map((numPapers) => {
        if (maxNumTasks === minNumTasks) {
          return 'rgba(30, 144, 255, 0.85)';
        }
        const ratio = (numPapers - minNumTasks) / (maxNumTasks - minNumTasks);
        const r = Math.round(30 + (255 - 30) * ratio);
        const g = Math.round(144 + (69 - 144) * ratio);
        const b = Math.round(255 + (0 - 255) * ratio);
        return `rgba(${r}, ${g}, ${b}, 0.85)`;
      });
      this.paper.methodColors = this.paper.methods.numPapers.map(
        (numPapers) => {
          if (maxNumMethods === minNumMethods) {
            return 'rgba(30, 144, 255, 0.85)';
          }
          const ratio =
            (numPapers - minNumMethods) / (maxNumMethods - minNumMethods);
          const r = Math.round(30 + (255 - 30) * ratio);
          const g = Math.round(144 + (69 - 144) * ratio);
          const b = Math.round(255 + (0 - 255) * ratio);
          return `rgba(${r}, ${g}, ${b}, 0.85)`;
        }
      );
      this.paper.codes = this.paper.codes.slice(0, 10).map((code) => {
        const shortened = code.url.split('/').splice(-2, 2);
        shortened[1] = '<span class="short">' + shortened[1] + '</span>';
        return {
          url: code.url,
          shortened: shortened.join('/'),
          rating: code.rating,
        };
      });
      await this.getRelatedPapers();
    });
  }

  private async getPaper() {
    this.loading = true;
    const res = await axios.get<GenericResponse<Paper>>(
      ServerService.LoginServer + `/paper/${this.id}`
    );
    if (res.status !== 200) {
      this.router.navigate(['/404']);
    }
    this.paper = res.data.data;
    this.loading = false;
  }

  public async toggleFav() {
    this.fav = !this.fav;
    const res = await axios.post<GenericResponse<any>>(
      this.fav
        ? ServerService.LoginServer + `/user/favourite`
        : ServerService.LoginServer + `/user/unfavourite`,
      {
        jwt: localStorage.getItem('access_token'),
        paperId: this.id,
      }
    );
    if (res.data.code !== 200) {
      this.snackBar.open(res.data.message, 'Close', {
        duration: 3000,
      });
      return;
    }
    if (this.fav) {
      this.snackBar.open('Added to favourites', 'Close', {
        duration: 3000,
      });
    } else {
      this.snackBar.open('Removed from favourites', 'Close', {
        duration: 3000,
      });
    }
  }

  public async gotoArxiv() {
    if (this.authorized) {
      const resp = await axios.post<GenericResponse<any>>(
        ServerService.LoginServer + `/user/record_viewed`,
        {
          jwt: localStorage.getItem('access_token'),
          paperId: this.id,
        }
      );
      if (resp.data.code !== 200) {
        this.snackBar.open(resp.data.message, 'Close', {
          duration: 3000,
        });
      }
    }
    const arxivId = this.paper.arxivId;
    const url = `https://arxiv.org/abs/${arxivId}`;
    window.open(url, '_blank');
  }

  gotoMethod(method: string) {
    window.location.pathname = `/method/${method}`;
  }

  gotoTask(task: string) {
    window.location.pathname = `/task/${task}`;
  }

  private async getRelatedPapers() {
    const resp = await axios.post(
      ServerService.N4JServer + '/paper/nearbyPaper',
      {
        arxivId: [this.id],
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
    this.relatedPapers = paperData.data;
  }
}
