import { Component } from '@angular/core';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    imports: [TopbarComponent],
    standalone: true
})
export class AboutComponent {

}

