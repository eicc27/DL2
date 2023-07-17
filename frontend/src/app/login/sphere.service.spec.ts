import { TestBed } from '@angular/core/testing';

import { SphereService } from './sphere.service';

describe('SphereService', () => {
  let service: SphereService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SphereService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
