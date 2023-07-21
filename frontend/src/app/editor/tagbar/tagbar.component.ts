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
import { MatTabGroup } from '@angular/material/tabs';

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

  @ViewChild('tabgroup')
  public tabgroup!: MatTabGroup;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTab'] && this.tabgroup) {
      console.log(this.tabgroup);
      this.tabgroup.selectedIndex = this.activeTab;
    }
  }

  public open(tab: Tab) {
    console.log(tab);
  }

  public tabClose(index: number) {
    this.tabCloseEvent.emit(index);
  }
}
