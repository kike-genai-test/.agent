import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Libro, LibrosService, CreateLibroDto } from '../../core/services/libros.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface LibroDialogData {
  libro?: Libro;
}

@Component({
  selector: 'app-form-libro',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.libro ? 'Modificar Libro' : 'Nuevo Libro' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" style="display:flex; flex-direction:column; gap:8px; padding-top:8px">
        <mat-form-field appearance="outline">
          <mat-label>Título</mat-label>
          <input matInput formControlName="titulo" />
          <mat-error>Título es requerido</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Autor</mat-label>
          <input matInput formControlName="autor" />
          <mat-error>Autor es requerido</mat-error>
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
        (click)="guardar()"
      >{{ data.libro ? 'Guardar Cambios' : 'Crear Libro' }}</button>
    </mat-dialog-actions>
  `,
})
export class FormLibroComponent {
  data: LibroDialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<FormLibroComponent>);
  private librosService = inject(LibrosService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    titulo: [this.data.libro?.titulo ?? '', Validators.required],
    autor:  [this.data.libro?.autor  ?? '', Validators.required],
  });

  loading = signal(false);
  error   = signal<string | null>(null);

  guardar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const dto = this.form.value as CreateLibroDto;
    const op$ = this.data.libro
      ? this.librosService.update(this.data.libro.id, dto)
      : this.librosService.create(dto);

    op$.subscribe({
      next: () => {
        const msg = this.data.libro ? 'Libro actualizado' : 'Libro creado';
        this.snack.open(msg, 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (e: { error?: { error?: string } }) => {
        this.loading.set(false);
        this.error.set(e?.error?.error ?? 'Error al guardar');
      },
    });
  }
}
