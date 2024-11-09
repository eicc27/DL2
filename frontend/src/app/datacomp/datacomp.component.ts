import { Component } from '@angular/core';
import axios from 'axios';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';
import Dataset from './dataset.model';
import { TopbarComponent } from '../topbar/topbar.component';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../loading/loading.component';

@Component({
    selector: 'app-datacomp',
    templateUrl: './datacomp.component.html',
    styleUrls: ['./datacomp.component.scss'],
    imports: [TopbarComponent, NgIf, NgFor, MatIconModule, LoadingComponent],
    standalone: true,
})
export class DatacompComponent {
  numDatasets = undefined;
  numCodes = undefined;
  loading = false;
  datasets: Dataset[] = [];

  constructor() {}

  async ngOnInit() {
    this.loading = true;
    const resp = await axios.get(
      ServerService.UserServer + '/dataset/datasets'
    );
    this.loading = false;
    const data = resp.data as GenericResponse<any>;
    this.numDatasets = data.data.dtsNum;
    this.numCodes = data.data.implNum;
    this.datasets = data.data.datasets;
  }

  goto(pathname: string) {
    window.location.pathname = pathname;
  }
}
