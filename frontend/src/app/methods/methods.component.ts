import { Component } from '@angular/core';
import axios, { Method } from 'axios';
import Task, { TaskResponse } from '../tasks/task.model';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TopbarComponent } from '../topbar/topbar.component';
import { NgFor, NgIf } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-methods',
  templateUrl: './methods.component.html',
  styleUrls: ['./methods.component.scss'],
  imports: [TopbarComponent, NgFor, NgIf, MarkdownModule, MatPaginatorModule],
  standalone: true,
})
export class MethodsComponent {
  public tasks: Task[] = [];
  public length: number = 0;

  async ngOnInit() {
    const resp = await axios.get(ServerService.UserServer + `/methods`);
    const data: GenericResponse<TaskResponse> = resp.data;
    this.tasks = data.data.tasks;
    this.length = data.data.totalElements;
  }

  public async changPage(event: PageEvent) {
    const index = event.pageIndex;
    const size = event.pageSize;
    console.log(index, size);
    const resp = await axios.get(
      ServerService.UserServer + `/methods?page=${index + 1}&size=${size}`
    );
    const data: GenericResponse<TaskResponse> = resp.data;
    this.tasks = data.data.tasks;
    this.length = data.data.totalElements;
  }
  public goto(name: string) {
    window.location.pathname = `/method/${name}`;
  }
}
