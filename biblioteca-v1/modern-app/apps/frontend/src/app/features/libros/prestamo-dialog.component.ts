import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Libro } from '../../core/services/libros.service';
import { SociosService } from '../../core/services/socios.service';
import { PrestamosService } from '../../core/services/prestamos.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface PrestamoDialogData {
  libro: Libro;
}

@Component({
  selector: 'app-prestamo-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Registrar Préstamo</h2>
    <mat-dialog-content>
      <p><strong>Libro:</strong> {{ data.libro.titulo }}</p>
      <p><strong>Autor:</strong> {{ data.libro.autor }}</p>

      <form [formGroup]="form" style="display:flex; flex-direction:column; gap:8px; margin-top:16px">
        <mat-form-field appearance="outline">
          <mat-label>ID del Socio</mat-label>
          <input matInput type="number" formControlName="socio_id" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Días de préstamo</mat-label>
          <input matInput type="number" formControlName="dias" min="1" />
        </mat-form-field>

        @if (error()) {
          <p style="color:#c62828; font-size:13px">{{ error() }}</p>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button
        mat-flat-button
        [disabled]="form.invalid || loading()"
        (click)="registrar()"
      >Registrar</button>
    </mat-dialog-actions>
  `,
})
export class PrestamoDialogComponent {
  data: PrestamoDialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<PrestamoDialogComponent>);
  private prestamosService = inject(PrestamosService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    socio_id: [null as number | null, [Validators.required, Validators.min(1)]],
    dias:     [14, [Validators.required, Validators.min(1)]],
  });

  loading = signal(false);
  error   = signal<string | null>(null);

  registrar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const { socio_id, dias } = this.form.value;
    this.prestamosService.create({
      libro_id: this.data.libro.id,
      socio_id: socio_id!,
      dias: dias!,
    }).subscribe({
      next: () => {
        this.snack.open('Préstamo registrado correctamente', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (e: { error?: { error?: string } }) => {
        this.loading.set(false);
        this.error.set(e?.error?.error ?? 'Error al registrar préstamo');
      },
    });
  }
}
