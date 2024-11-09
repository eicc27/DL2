import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfterComponent } from './after.component';

describe('AfterComponent', () => {
  let component: AfterComponent;
  let fixture: ComponentFixture<AfterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [AfterComponent]
});
    fixture = TestBed.createComponent(AfterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
