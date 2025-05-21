import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { removeAuthGuard } from './remove-auth.guard';

describe('removeAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => removeAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
