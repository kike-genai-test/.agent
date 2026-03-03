import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerNav: jest.Mock;

  beforeEach(() => {
    routerNav = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: Router, useValue: { navigate: routerNav } },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login()', () => {
    it('stores token and updates isLoggedIn signal on success', () => {
      service.login('admin', 'admin123').subscribe();

      const req = httpMock.expectOne('http://localhost:3000/auth/login');
      expect(req.request.method).toBe('POST');

      req.flush({
        token: 'mock-token-123',
        usuario: { id: 1, username: 'admin', rol: 'admin' },
      });

      expect(localStorage.getItem('biblioteca_token')).toBe('mock-token-123');
      expect(service.isLoggedIn()).toBe(true);
    });
  });

  describe('logout()', () => {
    it('clears token and sets isLoggedIn to false', () => {
      localStorage.setItem('biblioteca_token', 'some-token');
      service.logout();
      expect(localStorage.getItem('biblioteca_token')).toBeNull();
      expect(service.isLoggedIn()).toBe(false);
      expect(routerNav).toHaveBeenCalledWith(['/login']);
    });
  });
});
