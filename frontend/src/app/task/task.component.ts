import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Task } from './task.model';
import axios from 'axios';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent {
  public task!: Task;

  public constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      const task = params['task'];
      const resp = await axios.get(ServerService.UserServer + `/task?taskName=${decodeURI(task)}`);
      const data: GenericResponse<Task> = resp.data;
      this.task = data.data;
      const maxNumPapers = Math.max(...this.task.methodNumPapers);
      const minNumPapers = Math.min(...this.task.methodNumPapers);
      this.task.methodColors = this.task.methodNumPapers.map((numPapers) => {
        if (maxNumPapers === minNumPapers) {
          return 'rgba(30, 144, 255, 0.85)';
        }
        const ratio = (numPapers - minNumPapers) / (maxNumPapers - minNumPapers);
        const r = Math.round(30 + (255 - 30) * ratio);
        const g = Math.round(144 + (69 - 144) * ratio);
        const b = Math.round(255 + (0 - 255) * ratio);
        return `rgba(${r}, ${g}, ${b}, 0.85)`;
      });
    });
  }

  gotoMethod(method: string) {
    window.location.pathname = `/method/${method}`;
  }
}
