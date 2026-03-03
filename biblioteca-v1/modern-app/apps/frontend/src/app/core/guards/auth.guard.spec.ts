import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authMock: { isLoggedIn: jest.Mock };
  const fakeUrlTree = {} as UrlTree;

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/socios' } as RouterStateSnapshot)
    );

  beforeEach(() => {
    authMock = { isLoggedIn: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: { createUrlTree: jest.fn().mockReturnValue(fakeUrlTree) } },
      ],
    });
  });

  it('returns true when user is logged in', () => {
    authMock.isLoggedIn.mockReturnValue(true);
    expect(runGuard()).toBe(true);
  });

  it('returns UrlTree redirect when not logged in', () => {
    authMock.isLoggedIn.mockReturnValue(false);
    const result = runGuard();
    expect(result).toBe(fakeUrlTree);
    const router = TestBed.inject(Router);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
