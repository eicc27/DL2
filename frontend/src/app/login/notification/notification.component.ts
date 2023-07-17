import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  @Input("placeholder") public placeholder!: string;

  public show: boolean = false;

  public toggle() {
    this.show = !this.show;
  }
}
