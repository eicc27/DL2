import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SearchbarComponent } from '../searchbar/searchbar.component';
import { UserinfoComponent } from '../home/userinfo/userinfo.component';

@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.scss'],
    imports: [MatToolbarModule, SearchbarComponent, UserinfoComponent],
    standalone: true
})
export class TopbarComponent {
  public showFn() {
    window.location.pathname = '/';
  }

  public goto(route: string) {
    window.location.pathname = route;
  }
}
