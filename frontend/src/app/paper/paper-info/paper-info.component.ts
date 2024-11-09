import { Component, Input } from '@angular/core';
import Paper from '../paper.model';
import { NgFor, NgIf } from '@angular/common';
import { HighlightCapitalizedPipe } from 'src/app/highlight-capitalized.pipe';

@Component({
  selector: 'app-paper-info',
  templateUrl: './paper-info.component.html',
  styleUrls: ['./paper-info.component.scss'],
  imports: [NgFor, NgIf, HighlightCapitalizedPipe],
  standalone: true,
})
export class PaperInfoComponent {
  @Input('papers')
  public papers: Paper[] = [];

  @Input('accent')
  public accent = false;

  ngOnInit() {
    this.papers = this.papers.map((paper) => {
      let authors = paper.authors;
      if (authors.length > 2) {
        authors = authors.slice(0, 2);
        authors.push('et al.');
      }
      paper.authors = authors;
      return paper;
    });
  }

  public openPaper(id: string) {
    window.location.pathname = '/paper/' + id;
  }
}
