import { TestBed } from '@angular/core/testing';

import { GetInfosFrontService } from './get-infos-front.service';

describe('GetInfosFrontService', () => {
  let service: GetInfosFrontService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetInfosFrontService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
