import { Component } from '@angular/core';
import axios from 'axios';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';
import Dataset from './dataset.model';

@Component({
  selector: 'app-datacomp',
  templateUrl: './datacomp.component.html',
  styleUrls: ['./datacomp.component.scss'],
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
      ServerService.LoginServer + '/dataset/datasets'
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
