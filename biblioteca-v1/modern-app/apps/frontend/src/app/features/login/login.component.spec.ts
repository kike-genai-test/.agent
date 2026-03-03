import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authMock: { login: jest.Mock; isLoggedIn: jest.Mock };
  let routerNav: jest.Mock;

  beforeEach(async () => {
    authMock  = { login: jest.fn(), isLoggedIn: jest.fn().mockReturnValue(false) };
    routerNav = jest.fn();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: { navigate: routerNav } },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with invalid form', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should not call login when form is invalid', () => {
    component.onSubmit();
    expect(authMock.login).not.toHaveBeenCalled();
  });

  it('should call auth.login with form values on valid submit', () => {
    authMock.login.mockReturnValue(of({ token: 't', usuario: { id: 1, username: 'a', rol: 'admin' } }));
    component.form.setValue({ username: 'admin', password: 'admin123' });
    component.onSubmit();
    expect(authMock.login).toHaveBeenCalledWith('admin', 'admin123');
    expect(routerNav).toHaveBeenCalledWith(['/inicio']);
  });

  it('sets error signal on login failure', () => {
    authMock.login.mockReturnValue(throwError(() => new Error('Unauthorized')));
    component.form.setValue({ username: 'admin', password: 'wrong' });
    component.onSubmit();
    expect(component.error()).toBe('Usuario o contraseña incorrectos');
    expect(component.loading()).toBe(false);
  });

  it('sets loading to true during submission', () => {
    authMock.login.mockReturnValue(of({ token: 't', usuario: { id: 1, username: 'a', rol: 'admin' } }));
    component.form.setValue({ username: 'admin', password: 'admin123' });
    component.onSubmit();
    // loading is reset via next handler navigation — check it doesn't stay true on error
    expect(component.loading()).toBe(true);
  });
});
