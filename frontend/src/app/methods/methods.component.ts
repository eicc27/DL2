import { Component } from '@angular/core';
import axios, { Method } from 'axios';
import Task, { TaskResponse } from '../tasks/task.model';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-methods',
  templateUrl: './methods.component.html',
  styleUrls: ['./methods.component.scss']
})
export class MethodsComponent {
  public tasks: Task[] = [];
  public length: number = 0;

  async ngOnInit() {
    const resp = await axios.get(ServerService.LoginServer + `/methods`);
    const data: GenericResponse<TaskResponse> = resp.data;
    this.tasks = data.data.tasks;
    this.length = data.data.totalElements;
  }

  public async changPage(event: PageEvent) {
    const index = event.pageIndex;
    const size = event.pageSize;
    console.log(index, size);
    const resp = await axios.get(ServerService.LoginServer + `/methods?page=${index + 1}&size=${size}`);
    const data: GenericResponse<TaskResponse> = resp.data;
    this.tasks = data.data.tasks;
    this.length = data.data.totalElements;
  }
  public goto(name: string) {
    window.location.pathname = `/method/${name}`;
  }
}
