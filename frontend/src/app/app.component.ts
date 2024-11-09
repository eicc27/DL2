import { Component } from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet],
})
export class AppComponent {
  title = 'dl2';
}
