import { TestBed } from '@angular/core/testing';
import { LookupService } from './lookup.service';

describe('Lookup', () => {
  let service: LookupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LookupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
