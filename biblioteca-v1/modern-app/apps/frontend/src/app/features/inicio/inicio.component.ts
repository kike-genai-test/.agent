import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { SociosService } from '../../core/services/socios.service';
import { LibrosService } from '../../core/services/libros.service';
import { PrestamosService } from '../../core/services/prestamos.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule, RouterLink],
  styles: [`
    .dashboard {
      padding: 32px;
    }
    h1 {
      font-size: 28px;
      font-weight: 600;
      color: #1a237e;
      margin: 0 0 8px;
    }
    .subtitle { color: #666; margin: 0 0 32px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    mat-card {
      text-align: center;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    mat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    mat-icon.stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }
    .stat-number { font-size: 36px; font-weight: 700; }
    .stat-label { color: #666; font-size: 14px; }
    .color-socios { color: #1565c0; }
    .color-libros { color: #2e7d32; }
    .color-prestados { color: #e65100; }
  `],
  template: `
    <div class="dashboard">
      <h1>Panel Principal</h1>
      <p class="subtitle">Bienvenido al sistema de gestión de Biblioteca</p>

      <div class="stats-grid">
        <mat-card routerLink="/socios">
          <mat-card-content>
            <mat-icon class="stat-icon color-socios">people</mat-icon>
            <div class="stat-number color-socios">{{ totalSocios() }}</div>
            <div class="stat-label">Socios Activos</div>
          </mat-card-content>
        </mat-card>

        <mat-card routerLink="/libros">
          <mat-card-content>
            <mat-icon class="stat-icon color-libros">menu_book</mat-icon>
            <div class="stat-number color-libros">{{ totalLibros() }}</div>
            <div class="stat-label">Libros en Catálogo</div>
          </mat-card-content>
        </mat-card>

        <mat-card [routerLink]="['/libros']" [queryParams]="{ estado: 'disponible' }">
          <mat-card-content>
            <mat-icon class="stat-icon color-libros">check_circle</mat-icon>
            <div class="stat-number color-libros">{{ librosDisponibles() }}</div>
            <div class="stat-label">Libros Disponibles</div>
          </mat-card-content>
        </mat-card>

        <mat-card [routerLink]="['/libros']" [queryParams]="{ estado: 'prestado' }">
          <mat-card-content>
            <mat-icon class="stat-icon color-prestados">bookmark_remove</mat-icon>
            <div class="stat-number color-prestados">{{ librosPrestados() }}</div>
            <div class="stat-label">Libros Prestados</div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
})
export class InicioComponent implements OnInit {
  private sociosService   = inject(SociosService);
  private librosService   = inject(LibrosService);
  private prestamosService = inject(PrestamosService);

  totalSocios      = signal(0);
  totalLibros      = signal(0);
  librosDisponibles = signal(0);
  librosPrestados  = signal(0);

  ngOnInit(): void {
    this.sociosService.getAll().subscribe((socios) => {
      this.totalSocios.set(socios.length);
    });

    this.librosService.getAll().subscribe((libros) => {
      this.totalLibros.set(libros.length);
      this.librosDisponibles.set(libros.filter((l) => l.estado === 'disponible').length);
      this.librosPrestados.set(libros.filter((l) => l.estado === 'prestado').length);
    });

    this.prestamosService.getAll().subscribe();
  }
}
