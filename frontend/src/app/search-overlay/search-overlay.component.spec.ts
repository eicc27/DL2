import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchOverlayComponent } from './search-overlay.component';

describe('SearchOverlayComponent', () => {
  let component: SearchOverlayComponent;
  let fixture: ComponentFixture<SearchOverlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchOverlayComponent]
    });
    fixture = TestBed.createComponent(SearchOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
