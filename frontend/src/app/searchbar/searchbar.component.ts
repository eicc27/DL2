import { Component, ElementRef, ViewChild } from '@angular/core';
import axios from 'axios';
import { ServerService } from '../server.service';
import GenericResponse from '../GenericResponse.model';
import Paper from '../paper/paper.model';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
})
export class SearchbarComponent {
  public showOverlay = false;
  private focus = false;
  public searching = false;
  public shoudReadOnly = false;
  public papers: Paper[] = [];
  private timeout!: any;

  @ViewChild('searchbar')
  private searchBar!: ElementRef<HTMLDivElement>;

  constructor() {
    document.body.onkeydown = (e: KeyboardEvent) => {
      if (e.key != 'Escape') return;
      this.showOverlay = false;
      this.focus = false;
      this.searchBar.nativeElement.style.boxShadow = 'none';
      // unfocus
      this.searchBar.nativeElement.blur();
      this.shoudReadOnly = true;
    };
  }

  public toggleFocus(focus: boolean) {
    console.log(focus);
    this.focus = focus;
    this.shoudReadOnly = !focus;
    if (this.focus) this.showOverlay = true;
    if (this.focus) {
      this.searchBar.nativeElement.style.boxShadow =
        '0 3px 6px rgba(0,0,0,0.25)';
      this.searchBar.nativeElement.focus();
    } else {
      this.searchBar.nativeElement.style.boxShadow = 'none';
      this.searchBar.nativeElement.blur();
    }
  }

  private debounce(target: EventTarget | null) {
    // Changed to an arrow function
    const later = async () => {
      if (this.timeout) clearTimeout(this.timeout);
      await this._search(target);
    };
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(later, 500);
  }

  private async _search(target: EventTarget | null) {
    if (!target) return;
    const value = (target as HTMLInputElement).value;
    if (!value.length) return;
    this.searching = true;
    const resp = await axios.post(ServerService.SearchServer, {
      query: value,
    });
    const data = resp.data;
    if (!data) this.papers = [];
    else {
      this.papers = data.papers.map((paper: Paper) => {
        if (paper.authors.length > 2) {
          paper.authors = paper.authors.slice(0, 2);
          paper.authors.push('et al.');
        }
        return paper;
      });
    }
    this.searching = false;
    clearTimeout(this.timeout);
  }

  public search(target: EventTarget | null) {
    if (!target) return;
    const value = (target as HTMLInputElement).value;
    if (!value.length) {
      return;
    }
    this.debounce(target);
  }
}
