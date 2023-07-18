import { Component } from '@angular/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
  public showFn() {
    window.location.pathname = '/';
  }

  public goto(route: string) {
    window.location.pathname = route;
  }
}
