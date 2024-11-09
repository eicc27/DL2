import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperComponent } from './paper.component';

describe('PaperComponent', () => {
  let component: PaperComponent;
  let fixture: ComponentFixture<PaperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [PaperComponent]
});
    fixture = TestBed.createComponent(PaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
