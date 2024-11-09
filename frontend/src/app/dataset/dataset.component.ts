import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import axios, { AxiosResponse } from 'axios';
import { ServerService } from '../server.service';
import Dataset from '../datacomp/dataset.model';
import { AuthService } from '../auth.service';
import Submit from './submit.model';
import GenericResponse from '../GenericResponse.model';
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TopbarComponent } from '../topbar/topbar.component';
import { NgIf } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { MatTableModule } from '@angular/material/table';
import { LoadingComponent } from '../loading/loading.component';
import { HighlightCapitalizedPipe } from '../highlight-capitalized.pipe';

@Component({
    selector: 'app-dataset',
    templateUrl: './dataset.component.html',
    styleUrls: ['./dataset.component.scss'],
    imports: [TopbarComponent, NgIf, MarkdownModule, MatTableModule, LoadingComponent, HighlightCapitalizedPipe],
    standalone: true,
})
export class DatasetComponent {
  dataset!: Dataset;
  submits: Submit[] = [];
  name!: string;
  displayedColumns: string[] = ['id', 'acc', 'name', 'user', 'time'];
  loading = false;
  eval = false;
  authenticated = false;

  @ViewChild('fileInput')
  fileInputElement!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.eval = localStorage.getItem('eval') === 'true';
    this.authenticated = this.authService.isAuthenticated();
    this.route.params.subscribe(async (params) => {
      const dataset = params['dataset'];
      this.loading = true;
      let resp: AxiosResponse<GenericResponse<Dataset>>;
      if (!this.authService.isAuthenticated()) {
        resp = await axios.get(
          ServerService.UserServer + '/dataset/' + dataset
        );
      } else {
        this.name = this.authService.getToken()?.name;
        resp = await axios.post(
          ServerService.UserServer + '/dataset/' + dataset,
          {
            jwt: localStorage.getItem('access_token'),
          }
        );
      }
      this.loading = false;
      this.dataset = resp.data.data;
      this.submits = this.dataset.userCodes.map((code, index) => {
        return {
          id: index + 1,
          acc: code.acc,
          name: code.name,
          user: code.userName,
          time: code.time,
        };
      });
    });
  }

  async downloadLocal() {
    const name = this.dataset.name;
    this.loading = true;
    const resp = await axios.get(
      ServerService.UserServer + '/dataset/download/' + name
    );
    this.loading = false;
    const urls: string[] = resp.data.data;
    console.log(urls);
    urls.forEach((fileUrl, index) => {
      setTimeout(() => {
        let a = document.createElement('a');
        a.href = fileUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 1000); // This will wait index seconds before starting the download
    });
  }

  async downloadCloud() {
    if (!this.authService.isAuthenticated())
      window.location.pathname = '/login';
    this.loading = true;
    const resp = await axios.post(ServerService.LspServer + '/copy', {
      userId: this.authService.getToken()?.name,
      dataset: this.dataset.name,
    });
    this.loading = false;
    if (resp.data.code == 200) {
      this.snackBar.open('Dataset has been cloned to datacomp/', 'Close');
      setTimeout(() => {
        window.location.pathname = '/editor';
      }, 1000);
    } else {
      this.snackBar.open(resp.data.msg, 'Close');
    }
  }

  selectFile() {
    this.fileInputElement.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataset', this.dataset.name);
    formData.append('name', this.authService.getToken()!.name);
    this.loading = true;
    const resp = await axios
      .post(ServerService.UserServer + '/eval/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    this.loading = false;
    if (resp.data.code == 200) {
      this.snackBar.open('File evaluated successfully! Your score: ' + resp.data.data, 'Close');
    } else {
      this.snackBar.open(resp.data.msg, 'Close');
    }
  }
}
