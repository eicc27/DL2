import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Paper from './paper.model';
import axios from 'axios';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import Response from 'src/response.model';
import { LoadingComponent } from '../loading/loading.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { HighlightCapitalizedPipe } from '../highlight-capitalized.pipe';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PaperInfoComponent } from './paper-info/paper-info.component';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss'],
  imports: [
    LoadingComponent,
    TopbarComponent,
    HighlightCapitalizedPipe,
    NgIf,
    NgFor,
    MatIconModule,
    CommonModule,
    PaperInfoComponent,
    MarkdownModule,
  ],
  standalone: true,
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
  public tldr = "";

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  private async getFav() {
    const res = await axios.post<GenericResponse<boolean>>(
      ServerService.UserServer + `/user/get_favourite`,
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
      console.log(this.paper.tasks);
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
        console.log(r, g, b);
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
      this.paper.codes.sort((a, b) => b.rating - a.rating);
      await this.getRelatedPapers();
      if (this.authorized) {
        const query = `Introduce me this paper: ${this.paper.title}`;
        const resp = await axios.get("http://127.0.0.1:8092/search?query=" + query);
        this.tldr = resp.data.answer;
      }
    });
  }

  private async getPaper() {
    this.loading = true;
    const res = await axios.get<GenericResponse<Paper>>(
      ServerService.UserServer + `/paper/${this.id}`
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
        ? ServerService.UserServer + `/user/favourite`
        : ServerService.UserServer + `/user/unfavourite`,
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
        ServerService.UserServer + `/user/record_viewed`,
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
    const resp = await axios.get(
      `${ServerService.N4JServer}/paper/relatedPapers?id=${this.id}`
    );
    const data = resp.data as Response<string[]>;
    ServerService.UserServer;
    const papersResp = await axios.post(
      `${ServerService.UserServer}/paper/papers`,
      {
        arxivIds: data.data,
      }
    );
    this.relatedPapers = (papersResp.data as Response<Paper[]>).data.filter(
      (p) => p.arxivId != this.id
    );
  }
}
