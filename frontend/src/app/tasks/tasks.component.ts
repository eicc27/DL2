import { Component } from '@angular/core';
import Task, { TaskResponse } from './task.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import axios from 'axios';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';
import { TopbarComponent } from '../topbar/topbar.component';
import { NgFor, NgIf } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  imports: [TopbarComponent, NgIf, NgFor, MarkdownModule, MatPaginatorModule],
  standalone: true,
})
export class TasksComponent {
  public tasks: Task[] = [];
  public length: number = 0;

  async ngOnInit() {
    const resp = await axios.get(ServerService.UserServer + `/tasks`);
    const data: GenericResponse<TaskResponse> = resp.data;
    this.tasks = data.data.tasks;
    this.length = data.data.totalElements;
  }

  public async changPage(event: PageEvent) {
    const index = event.pageIndex;
    const size = event.pageSize;
    console.log(index, size);
    const resp = await axios.get(
      ServerService.UserServer + `/tasks?page=${index + 1}&size=${size}`
    );
    const data: GenericResponse<TaskResponse> = resp.data;
    this.tasks = [];
    this.tasks = data.data.tasks;
    this.length = data.data.totalElements;
  }

  public goto(name: string) {
    window.location.pathname = `/task/${name}`;
  }
}
