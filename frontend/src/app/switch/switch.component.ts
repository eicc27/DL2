import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  imports: [MatIconModule, NgIf],
  standalone: true,
})
export class SwitchComponent {
  public constructor(public renderer: Renderer2) {}

  @Input('current')
  public currentFontIcon!: string;

  @Input('next')
  public nextFontIcon!: string;
  public c1 = 'current';
  public c2 = 'next';
  @Output()
  public onCurrentChange = new EventEmitter<string>();

  public toggle() {
    [this.c1, this.c2] = [this.c2, this.c1];
    this.onCurrentChange.emit(this.c1);
  }
}
