import { Component, Input } from '@angular/core';
import Paper from '../paper/paper.model';

@Component({
  selector: 'app-search-overlay',
  templateUrl: './search-overlay.component.html',
  styleUrls: ['./search-overlay.component.scss']
})
export class SearchOverlayComponent {
  @Input('papers')
  public papers!: Paper[];

  @Input('searching')
  public searching!: boolean;

  public openPaper(id: string) {
    window.location.pathname = '/paper/' + id;
  }
}
