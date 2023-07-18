import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Paper from './paper.model';
import axios from 'axios';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';

@Component({
  selector: 'app-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss'],
})
export class PaperComponent implements OnInit {
  public id!: string;
  public paper!: Paper;
  public loading = false;
  @ViewChild("title")
  public titleElement!: ElementRef<HTMLHeadElement>;

  public constructor(private route: ActivatedRoute, private router: Router) {}

  public ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.id = params['id'];
      await this.getPaper();
      this.paper.codes = this.paper.codes.slice(0, 10).map((code) => {
        return {
          url: code.url,
          shortened: code.url.split('/').splice(-2, 2).join('/'),
          rating: code.rating
        }
      });
    });
  }

  public ngAfterViewInit() {
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
}
