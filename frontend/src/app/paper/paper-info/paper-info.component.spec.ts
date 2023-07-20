import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperInfoComponent } from './paper-info.component';

describe('PaperInfoComponent', () => {
  let component: PaperInfoComponent;
  let fixture: ComponentFixture<PaperInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaperInfoComponent]
    });
    fixture = TestBed.createComponent(PaperInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
