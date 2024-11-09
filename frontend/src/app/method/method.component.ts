import { Component } from '@angular/core';
import { Task } from '../task/task.model';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';
import { TopbarComponent } from '../topbar/topbar.component';
import { MarkdownModule } from 'ngx-markdown';
import { CommonModule, NgIf } from '@angular/common';
import { PaperInfoComponent } from '../paper/paper-info/paper-info.component';

@Component({
    selector: 'app-method',
    templateUrl: './method.component.html',
    styleUrls: ['./method.component.scss'],
    imports: [TopbarComponent, MarkdownModule, CommonModule, PaperInfoComponent, NgIf],
    standalone: true
})
export class MethodComponent {
  public task!: Task;

  public constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      const task = params['method'];
      const resp = await axios.get(ServerService.UserServer + `/method?methodName=${task}`);
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
      console.log(this.task.intro);
    });
  }

  gotoMethod(task: string) {
    window.location.pathname = `/task/${task}`;
  }
}
