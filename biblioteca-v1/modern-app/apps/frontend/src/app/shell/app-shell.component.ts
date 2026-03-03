import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatListModule, MatIconModule,
  ],
  styles: [`
    .sidenav-container { height: 100vh; }

    .sidenav {
      width: 240px;
      background: #1a237e;
      color: #fff;
      border-radius: 0 !important;
      display: flex;
      flex-direction: column;
    }

    ::ng-deep .sidenav .mat-drawer-inner-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .sidenav-header {
      padding: 24px 16px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #fff;
      border-bottom: 1px solid rgba(255,255,255,0.2);
      margin-bottom: 8px;
    }

    .sidenav-header mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    nav { flex: 1; }

    ::ng-deep .sidenav mat-nav-list {
      --mdc-list-list-item-container-shape: 0;
      --mat-list-active-indicator-shape: 0;
    }

    ::ng-deep .sidenav mat-nav-list .mdc-list-item__primary-text {
      color: #fff !important;
    }

    ::ng-deep .sidenav mat-nav-list .mat-mdc-list-item .mat-icon {
      color: #fff !important;
      margin-right: 12px;
    }

    ::ng-deep .sidenav mat-nav-list .mat-mdc-list-item.nav-active {
      background: rgba(255,255,255,0.18) !important;
    }

    .sidenav-footer {
      padding: 16px 12px;
      border-top: 1px solid rgba(255,255,255,0.15);
    }

    .logout-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
      font-family: Roboto, sans-serif;
      background: rgba(255,255,255,0.15);
      border-radius: 8px;
    }

    .logout-item:hover { background: rgba(255,255,255,0.22); }

    .logout-item mat-icon {
      color: #fff;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .content {
      background: #f5f5f5;
      flex: 1;
      overflow: auto;
    }
  `],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav class="sidenav" mode="side" opened>
        <div class="sidenav-header">
          <mat-icon>auto_stories</mat-icon>
          <span>Biblioteca</span>
        </div>

        <nav>
          <mat-nav-list>
            <a mat-list-item routerLink="/inicio" routerLinkActive="nav-active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Panel Principal</span>
            </a>
            <a mat-list-item routerLink="/socios" routerLinkActive="nav-active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Socios</span>
            </a>
            <a mat-list-item routerLink="/libros" routerLinkActive="nav-active">
              <mat-icon matListItemIcon>menu_book</mat-icon>
              <span matListItemTitle>Libros</span>
            </a>
          </mat-nav-list>
        </nav>

        <div class="sidenav-footer">
          <div
            class="logout-item"
            (click)="auth.logout()"
            role="button"
            tabindex="0"
            (keydown.enter)="auth.logout()"
            (keydown.space)="auth.logout()"
          >
            <mat-icon>logout</mat-icon>
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class AppShellComponent {
  auth = inject(AuthService);
}
