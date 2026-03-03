import {
  ChangeDetectionStrategy, Component, inject, signal, computed, OnInit,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Socio, SociosService } from '../../core/services/socios.service';
import { FormSocioComponent, SocioDialogData } from './form-socio.component';

@Component({
  selector: 'app-lista-socios',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule, MatFormFieldModule, MatInputModule, MatIconModule,
    MatButtonModule, MatDialogModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Socios</h1>
          <p class="page-subtitle">{{ socios().length }} registros</p>
        </div>
        <button mat-flat-button (click)="abrirFormulario()">
          <mat-icon>person_add</mat-icon> Nuevo Socio
        </button>
      </div>

      <!-- Search -->
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar nombre o documento</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput (input)="busqueda.set($any($event.target).value)" />
      </mat-form-field>

      @if (loading()) {
        <div style="display:flex; justify-content:center; padding:48px">
          <mat-spinner diameter="48" />
        </div>
      } @else {
        <!-- Table -->
        <div class="mat-elevation-z2 table-wrapper">
          <table mat-table [dataSource]="filtrados()">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let row">{{ row.id }}</td>
            </ng-container>

            <ng-container matColumnDef="apellidos">
              <th mat-header-cell *matHeaderCellDef>Apellidos</th>
              <td mat-cell *matCellDef="let row">{{ row.apellidos }}</td>
            </ng-container>

            <ng-container matColumnDef="nombres">
              <th mat-header-cell *matHeaderCellDef>Nombres</th>
              <td mat-cell *matCellDef="let row">{{ row.nombres }}</td>
            </ng-container>

            <ng-container matColumnDef="nro_doc">
              <th mat-header-cell *matHeaderCellDef>N° Documento</th>
              <td mat-cell *matCellDef="let row">{{ row.nro_doc || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="domicilio">
              <th mat-header-cell *matHeaderCellDef>Domicilio</th>
              <td mat-cell *matCellDef="let row">{{ row.domicilio || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="telefono">
              <th mat-header-cell *matHeaderCellDef>Teléfono</th>
              <td mat-cell *matCellDef="let row">{{ row.telefono || '—' }}</td>
            </ng-container>

            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef style="text-align:center">Acciones</th>
              <td mat-cell *matCellDef="let row" style="text-align:center; white-space:nowrap">
                <button
                  mat-icon-button
                  matTooltip="Editar"
                  (click)="abrirFormulario(row)"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-icon-button
                  matTooltip="Dar de Baja"
                  color="warn"
                  (click)="confirmarBaja(row)"
                >
                  <mat-icon>person_off</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let row; columns: columnas"></tr>

            <!-- Empty state -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" [attr.colspan]="columnas.length" style="padding:32px; text-align:center; color:#666">
                @if (busqueda()) {
                  No se encontraron socios para "{{ busqueda() }}"
                } @else {
                  No hay socios registrados
                }
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
    .page-title  { font-size: 24px; font-weight: 600; color: #1a237e; margin: 0; }
    .page-subtitle { font-size: 14px; color: #666; margin: 4px 0 0; }
    .search-field { width: 100%; max-width: 480px; margin-bottom: 16px; }
    .table-wrapper { border-radius: 8px; overflow: hidden; }
    table { width: 100%; }
    th.mat-header-cell { background: #f5f5f5; font-weight: 600; color: #333; }
  `],
})
export class ListaSociosComponent implements OnInit {
  private sociosService = inject(SociosService);
  private dialog         = inject(MatDialog);
  private snack          = inject(MatSnackBar);

  socios  = signal<Socio[]>([]);
  busqueda = signal('');
  loading  = signal(false);

  columnas = ['id', 'apellidos', 'nombres', 'nro_doc', 'domicilio', 'telefono', 'acciones'];

  filtrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.socios();
    return this.socios().filter(s =>
      s.apellidos.toLowerCase().includes(q) ||
      s.nombres.toLowerCase().includes(q)   ||
      (s.nro_doc ?? '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.loading.set(true);
    this.sociosService.getAll().subscribe({
      next: (data) => { this.socios.set(data); this.loading.set(false); },
      error: ()     => { this.loading.set(false); },
    });
  }

  abrirFormulario(socio?: Socio): void {
    const data: SocioDialogData = { socio };
    const ref = this.dialog.open(FormSocioComponent, {
      width: '480px',
      data,
    });
    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.cargar();
    });
  }

  confirmarBaja(socio: Socio): void {
    const ok = confirm(`¿Desea dar de baja a ${socio.apellidos}, ${socio.nombres}?`);
    if (!ok) return;
    this.sociosService.delete(socio.id).subscribe({
      next: () => {
        this.snack.open('Socio dado de baja', 'OK', { duration: 3000 });
        this.cargar();
      },
      error: () => {
        this.snack.open('No se pudo dar de baja al socio', 'Cerrar', { duration: 4000 });
      },
    });
  }
}
