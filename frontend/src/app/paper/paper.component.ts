import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Paper from './paper.model';
import axios from 'axios';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
        const ratio = (numPapers - minNumTasks) / (maxNumTasks - minNumTasks);
        const r = Math.round(30 + (255 - 30) * ratio);
        const g = Math.round(144 + (69 - 144) * ratio);
        const b = Math.round(255 + (0 - 255) * ratio);
        return `rgba(${r}, ${g}, ${b}, 0.85)`;
      });
      this.paper.methodColors = this.paper.methods.numPapers.map(
        (numPapers) => {
          const ratio =
            (numPapers - minNumMethods) / (maxNumMethods - minNumMethods);
          const r = Math.round(30 + (255 - 30) * ratio);
          const g = Math.round(144 + (69 - 144) * ratio);
          const b = Math.round(255 + (0 - 255) * ratio);
          return `rgba(${r}, ${g}, ${b}, 0.85)`;
        }
      );
      this.paper.codes = this.paper.codes.slice(0, 10).map((code) => {
        return {
          url: code.url,
          shortened: code.url.split('/').splice(-2, 2).join('/'),
          rating: code.rating,
        };
      });
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
}
