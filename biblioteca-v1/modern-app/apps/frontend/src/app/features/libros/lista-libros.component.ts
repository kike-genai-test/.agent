import {
  ChangeDetectionStrategy, Component, inject, signal, computed, OnInit,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { Libro, LibrosService } from '../../core/services/libros.service';
import { PrestamoDialogComponent, PrestamoDialogData } from './prestamo-dialog.component';

@Component({
  selector: 'app-lista-libros',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatIconModule, MatButtonModule, MatDialogModule, MatProgressSpinnerModule,
    MatTooltipModule, FormsModule, SlicePipe,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Libros</h1>
          <p class="page-subtitle">{{ filtrados().length }} registros</p>
        </div>
        <button mat-flat-button (click)="abrirFormulario()">
          <mat-icon>add</mat-icon> Nuevo Libro
        </button>
      </div>

      <!-- Filters row -->
      <div class="filters-row">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar título o autor</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput (input)="busqueda.set($any($event.target).value)" />
        </mat-form-field>

        <mat-form-field appearance="outline" style="width:180px">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="estadoFiltro" (ngModelChange)="estadoFiltroSignal.set($event)">
            <mat-option value="">Todos</mat-option>
            <mat-option value="disponible">Disponible</mat-option>
            <mat-option value="prestado">Prestado</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <div style="display:flex; justify-content:center; padding:48px">
          <mat-spinner diameter="48" />
        </div>
      } @else {
        <div class="mat-elevation-z2 table-wrapper">
          <table mat-table [dataSource]="filtrados()">

            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let row">{{ row.id }}</td>
            </ng-container>

            <ng-container matColumnDef="titulo">
              <th mat-header-cell *matHeaderCellDef>Título</th>
              <td mat-cell *matCellDef="let row">{{ row.titulo }}</td>
            </ng-container>

            <ng-container matColumnDef="autor">
              <th mat-header-cell *matHeaderCellDef>Autor</th>
              <td mat-cell *matCellDef="let row">{{ row.autor }}</td>
            </ng-container>

            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let row">
                <span [class]="row.estado === 'disponible' ? 'badge-disponible' : 'badge-prestado'">
                  {{ row.estado }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="socio">
              <th mat-header-cell *matHeaderCellDef>Socio</th>
              <td mat-cell *matCellDef="let row">
                @if (row.socio_apellidos) {
                  {{ row.socio_apellidos }}, {{ row.socio_nombres }}
                } @else {
                  —
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="fecha_prestamo">
              <th mat-header-cell *matHeaderCellDef>Fecha Préstamo</th>
              <td mat-cell *matCellDef="let row">
                {{ row.fecha_prestamo ? (row.fecha_prestamo | slice:0:10) : '—' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="fecha_devolucion">
              <th mat-header-cell *matHeaderCellDef>Fecha Devolución</th>
              <td mat-cell *matCellDef="let row">
                {{ row.fecha_devolucion ? (row.fecha_devolucion | slice:0:10) : '—' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="dias">
              <th mat-header-cell *matHeaderCellDef>Días</th>
              <td mat-cell *matCellDef="let row">{{ row.dias ?? '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef style="text-align:center">Acciones</th>
              <td mat-cell *matCellDef="let row" style="text-align:center; white-space:nowrap">
                <button mat-icon-button matTooltip="Editar" (click)="abrirFormulario(row)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Eliminar" color="warn" (click)="confirmarEliminar(row)">
                  <mat-icon>delete</mat-icon>
                </button>
                @if (row.estado === 'disponible') {
                  <button
                    mat-icon-button
                    matTooltip="Registrar Préstamo"
                    style="color:#388e3c"
                    (click)="togglePrestamo(row)"
                  >
                    <mat-icon>bookmark_add</mat-icon>
                  </button>
                } @else {
                  <button
                    mat-icon-button
                    matTooltip="Registrar Devolución"
                    style="color:#e65100"
                    (click)="togglePrestamo(row)"
                  >
                    <mat-icon>bookmark_remove</mat-icon>
                  </button>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let row; columns: columnas"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" [attr.colspan]="columnas.length"
                  style="padding:32px; text-align:center; color:#666">
                No hay libros para mostrar
              </td>
            </tr>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .page-title    { font-size: 24px; font-weight: 600; color: #1a237e; margin: 0; }
    .page-subtitle { font-size: 14px; color: #666; margin: 4px 0 0; }
    .filters-row   { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; }
    .search-field  { flex: 1; min-width: 200px; }
    .table-wrapper { border-radius: 8px; overflow: hidden; }
    table { width: 100%; }
    th.mat-header-cell { background: #f5f5f5; font-weight: 600; color: #333; }
  `],
})
export class ListaLibrosComponent implements OnInit {
  private librosService = inject(LibrosService);
  private dialog         = inject(MatDialog);
  private snack          = inject(MatSnackBar);

  libros           = signal<Libro[]>([]);
  busqueda         = signal('');
  estadoFiltro     = '';
  estadoFiltroSignal = signal<string>('');
  loading          = signal(false);

  columnas = ['id', 'titulo', 'autor', 'estado', 'socio', 'fecha_prestamo', 'fecha_devolucion', 'dias', 'acciones'];

  filtrados = computed(() => {
    const q      = this.busqueda().toLowerCase().trim();
    const estado = this.estadoFiltroSignal();
    return this.libros().filter(l => {
      const matchText = !q ||
        l.titulo.toLowerCase().includes(q) ||
        l.autor.toLowerCase().includes(q);
      const matchEstado = !estado || l.estado === estado;
      return matchText && matchEstado;
    });
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.loading.set(true);
    this.librosService.getAll().subscribe({
      next: (data) => { this.libros.set(data); this.loading.set(false); },
      error: ()     => { this.loading.set(false); },
    });
  }

  abrirFormulario(libro?: Libro): void {
    // Simple inline dialog using the same approach as socios
    import('./form-libro.component').then(m => {
      const ref = this.dialog.open(m.FormLibroComponent, {
        width: '480px',
        data: { libro },
      });
      ref.afterClosed().subscribe((guardado) => {
        if (guardado) this.cargar();
      });
    });
  }

  confirmarEliminar(libro: Libro): void {
    const ok = confirm(`¿Eliminar "${libro.titulo}"?`);
    if (!ok) return;
    this.librosService.delete(libro.id).subscribe({
      next: () => {
        this.snack.open('Libro eliminado', 'OK', { duration: 3000 });
        this.cargar();
      },
      error: () => this.snack.open('No se pudo eliminar el libro', 'Cerrar', { duration: 4000 }),
    });
  }

  togglePrestamo(libro: Libro): void {
    if (libro.estado === 'disponible') {
      const data: PrestamoDialogData = { libro };
      const ref = this.dialog.open(PrestamoDialogComponent, { width: '420px', data });
      ref.afterClosed().subscribe((creado) => {
        if (creado) this.cargar();
      });
    } else {
      const ok = confirm(`¿Registrar devolución de "${libro.titulo}"?`);
      if (!ok) return;
      this.librosService.devolver(libro.id).subscribe({
        next: () => {
          this.snack.open('Devolución registrada', 'OK', { duration: 3000 });
          this.cargar();
        },
        error: () => this.snack.open('Error al registrar devolución', 'Cerrar', { duration: 4000 }),
      });
    }
  }
}
