import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderItemComponent } from './folder-item.component';

describe('FolderItemComponent', () => {
  let component: FolderItemComponent;
  let fixture: ComponentFixture<FolderItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FolderItemComponent]
    });
    fixture = TestBed.createComponent(FolderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
