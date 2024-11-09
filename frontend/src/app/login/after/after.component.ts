import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ServerService } from 'src/app/server.service';
import GenericResponse from 'src/app/GenericResponse.model';
import axios from 'axios';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { TopbarComponent } from 'src/app/topbar/topbar.component';
import { LoadingComponent } from 'src/app/loading/loading.component';
import { MatIconModule } from '@angular/material/icon';
import { MarkdownModule } from 'ngx-markdown';
import { FormsModule } from '@angular/forms';

interface Task {
  name: string;
  numPapers: number;
  intro: string;
  expanded: boolean;
  focused: boolean;
}

@Component({
  selector: 'app-after',
  templateUrl: './after.component.html',
  styleUrls: ['./after.component.scss'],
  imports: [
    NgFor,
    NgIf,
    TopbarComponent,
    LoadingComponent,
    MatIconModule,
    MarkdownModule,
    FormsModule,
    CommonModule,
  ],
  standalone: true,
})
export class AfterComponent implements AfterViewInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedTasks: string[] = [];
  range = 0;
  optionWidth = 80;
  query = '';
  loading = false;
  private authorized = this.authService.isAuthenticated();

  @ViewChildren('filtered')
  taskElements!: QueryList<ElementRef<HTMLDivElement>>;

  public constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngAfterViewInit() {
    if (!this.authorized) {
      window.location.pathname = '/login';
      return;
    }
    axios
      .get(ServerService.UserServer + '/tasks?page=0&num=30')
      .then((resp) => {
        console.log(resp.data.data.tasks);
        this.range = this.optionWidth / resp.data.data.tasks[0].numPapers;
        this.tasks = resp.data.data.tasks
          .filter((t: any) => t.intro.length)
          .map((t: any) => {
            return {
              name: t.name,
              numPapers: t.numPapers,
              intro: t.intro,
              expanded: false,
              focused: false,
            };
          });
        this.filteredTasks = this.tasks.slice();
      });
    axios
      .post(ServerService.UserServer + '/user/choseTasks', {
        jwt: localStorage.getItem('access_token'),
      })
      .then((resp) => {
        const data: GenericResponse<any> = resp.data;
        this.selectedTasks.push(...data.data.tasks);
      });
  }

  private shrink(index: number) {
    this.filteredTasks[index].expanded = false;
    const taskElement = this.taskElements.get(index)!.nativeElement;
    const titleElement = taskElement.querySelector('span')!;
    taskElement.style.height = '2em';
    titleElement.style.fontSize = '1em';
  }

  private expand(index: number) {
    this.filteredTasks[index].expanded = true;
    const taskElement = this.taskElements.get(index)!.nativeElement;
    const mdElement = taskElement.querySelector('markdown')!;
    const titleElement = taskElement.querySelector('span')!;
    taskElement.style.height = `calc(2em + ${
      mdElement.getBoundingClientRect().height
    }px)`;
    titleElement.style.fontSize = '1.2em';
  }

  toggleSelection(task: string) {
    // find task in filtered tasks
    const index = this.filteredTasks.map((t) => t.name).indexOf(task);
    // shrink all details
    this.shrink(index);
    if (!this.selectedTasks.includes(task)) {
      this.selectedTasks.push(task);
    } else {
      this.selectedTasks.splice(this.selectedTasks.indexOf(task), 1);
    }
  }

  toggleTaskIntro(task: string) {
    // find task in filtered tasks
    const index = this.filteredTasks.map((t) => t.name).indexOf(task);
    this.tasks[index].focused = !this.tasks[index].focused;
    // mouseenter
    if (this.tasks[index].focused) {
      setTimeout(() => {
        if (!this.tasks[index].focused) return;
        this.expand(index);
      }, 1000);
    }
    // mouseleave
    else {
      this.shrink(index);
    }
  }

  async submit() {
    try {
      this.loading = true;
      await axios.post(ServerService.UserServer + '/user/likedTasks', {
        jwt: localStorage.getItem('access_token'),
        taskIds: this.selectedTasks,
      });
      this.loading = false;
      window.location.pathname = '/home';
    } catch (e) {
      window.alert('A network error occurred while saving data: ' + e);
    }
  }

  includes(task: string) {
    const t = this.selectedTasks.includes(task);
    // console.log(t);
    return t;
  }

  filterTasks(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    console.log(value);
    if (!value) {
      this.filteredTasks = this.tasks.slice();
      return;
    }
    this.filteredTasks = this.tasks.filter((task) =>
      task.name.toLowerCase().includes(value.toLowerCase())
    );
  }
}
