import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchbarComponent {
  private focus = false;
  @ViewChild('searchbar')
  private searchBar!: ElementRef<HTMLDivElement>;

  public toggleFocus() {
    this.focus = !this.focus;
    if (this.focus) {
      this.searchBar.nativeElement.style.boxShadow = '0 3px 6px rgba(0,0,0,0.25)';
    } else {
      this.searchBar.nativeElement.style.boxShadow = 'none';
    }
  }
}
