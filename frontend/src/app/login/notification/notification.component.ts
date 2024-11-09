import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
    imports: [NgIf],
    standalone: true
})
export class NotificationComponent {
  @Input("placeholder") public placeholder!: string;

  public show: boolean = false;

  public toggle() {
    this.show = !this.show;
  }
}
