import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FsComponent } from './fs.component';

describe('FsComponent', () => {
  let component: FsComponent;
  let fixture: ComponentFixture<FsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [FsComponent]
});
    fixture = TestBed.createComponent(FsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
