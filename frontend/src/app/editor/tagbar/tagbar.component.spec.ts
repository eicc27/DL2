import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagbarComponent } from './tagbar.component';

describe('TagbarComponent', () => {
  let component: TagbarComponent;
  let fixture: ComponentFixture<TagbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [TagbarComponent]
});
    fixture = TestBed.createComponent(TagbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
