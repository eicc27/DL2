import { Component, Input } from '@angular/core';
import Paper from '../paper/paper.model';
import { NgFor, NgIf } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

@Component({
    selector: 'app-search-overlay',
    templateUrl: './search-overlay.component.html',
    styleUrls: ['./search-overlay.component.scss'],
    imports: [NgIf, NgFor, MarkdownModule],
    standalone: true
})
export class SearchOverlayComponent {
  @Input('papers')
  public papers!: Paper[];

  @Input('searching')
  public searching!: boolean;

  @Input('mode')
  public mode!: string;

  @Input('answer')
  public answer: string = '';

  public openPaper(id: string) {
    window.location.pathname = '/paper/' + id;
  }
}
