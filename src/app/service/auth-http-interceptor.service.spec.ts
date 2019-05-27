import { TestBed, inject } from '@angular/core/testing';

import { AuthHttpInterceptorService } from './auth-http-interceptor.service';

describe('AuthHttpInterceptorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthHttpInterceptorService]
    });
  });

  it('should be created', inject([AuthHttpInterceptorService], (service: AuthHttpInterceptorService) => {
    expect(service).toBeTruthy();
  }));
});
