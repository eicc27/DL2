import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileItemComponent } from './file-item.component';

describe('FileItemComponent', () => {
  let component: FileItemComponent;
  let fixture: ComponentFixture<FileItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FileItemComponent]
    });
    fixture = TestBed.createComponent(FileItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
