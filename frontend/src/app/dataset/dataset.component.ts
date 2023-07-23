import { Component, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import axios, { AxiosResponse } from 'axios';
import { ServerService } from '../server.service';
import Dataset from '../datacomp/dataset.model';
import { AuthService } from '../auth.service';
import Submit from './submit.model';
import GenericResponse from '../GenericResponse.model';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss'],
})
export class DatasetComponent {
  dataset!: Dataset;
  submits: Submit[] = [];
  name!: string;
  displayedColumns: string[] = ['id', 'acc', 'name', 'user', 'time'];
  loading = false;
  eval = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.eval = localStorage.getItem('eval') === 'true';
    this.route.params.subscribe(async (params) => {
      const dataset = params['dataset'];
      this.loading = true;
      let resp: AxiosResponse<GenericResponse<Dataset>>;
      if (!this.authService.isAuthenticated()) {
        resp = await axios.get(
          ServerService.LoginServer + '/dataset/' + dataset
        );
      } else {
        this.name = this.authService.getToken()?.name;
        resp = await axios.post(
          ServerService.LoginServer + '/dataset/' + dataset,
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
      ServerService.LoginServer + '/dataset/download/' + name
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
}
