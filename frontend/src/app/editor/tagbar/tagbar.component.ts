import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import axios from 'axios';
import GenericResponse from 'src/app/GenericResponse.model';
import { AuthService } from 'src/app/auth.service';
import { ServerService } from 'src/app/server.service';
import OpenResponse from '../fs/OpenResponse';

export interface Tab {
  name: string;
  path: string;
  saved: boolean;
}

@Component({
  selector: 'app-tagbar',
  templateUrl: './tagbar.component.html',
  styleUrls: ['./tagbar.component.scss'],
})
export class TagbarComponent implements OnChanges {
  @Input('tabs')
  public tabs!: Tab[];

  @Input('activeTab')
  public activeTab!: number;

  @Output('tabClose')
  public tabCloseEvent = new EventEmitter<number>();

  @Output('fileOpened')
  public fileOpened = new EventEmitter<string>();

  @ViewChild('tabgroup')
  public tabgroup!: MatTabGroup;

  public constructor(private authService: AuthService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTab'] && this.tabgroup) {
      // console.log(this.tabgroup);
      this.tabgroup.selectedIndex = this.activeTab;
    }
  }

  public async open(event: MatTabChangeEvent) {
    const tab = this.tabs[event.index];
    const absPath = tab.path;
    console.log(absPath);
    const resp = await axios.post(`${ServerService.LspServer}/open`, {
      path: absPath,
      userId: this.authService.getToken()!.name,
    });
    const data: GenericResponse<OpenResponse> = resp.data;
    if (data.code == 200) {
      this.fileOpened.emit(data.data.content);
    }
  }

  public tabClose(index: number) {
    this.tabCloseEvent.emit(index);
  }
}
