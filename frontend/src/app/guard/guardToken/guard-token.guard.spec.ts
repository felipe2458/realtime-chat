import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { guardTokenGuard } from './guard-token.guard';

describe('guardTokenGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => guardTokenGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
