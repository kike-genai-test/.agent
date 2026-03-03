import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Socio, SociosService, CreateSocioDto } from '../../core/services/socios.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface SocioDialogData {
  socio?: Socio; // null = create mode
}

@Component({
  selector: 'app-form-socio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.socio ? 'Modificar Socio' : 'Nuevo Socio' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" style="display:flex; flex-direction:column; gap:8px; padding-top:8px">
        <mat-form-field appearance="outline">
          <mat-label>Apellidos</mat-label>
          <input matInput formControlName="apellidos" />
          <mat-error>Apellidos es requerido</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Nombres</mat-label>
          <input matInput formControlName="nombres" />
          <mat-error>Nombres es requerido</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Nº Documento</mat-label>
          <input matInput formControlName="nro_doc" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Domicilio</mat-label>
          <input matInput formControlName="domicilio" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono" />
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
      >{{ data.socio ? 'Guardar Cambios' : 'Crear Socio' }}</button>
    </mat-dialog-actions>
  `,
})
export class FormSocioComponent {
  data: SocioDialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<FormSocioComponent>);
  private sociosService = inject(SociosService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    apellidos: [this.data.socio?.apellidos ?? '', Validators.required],
    nombres:   [this.data.socio?.nombres   ?? '', Validators.required],
    nro_doc:   [this.data.socio?.nro_doc   ?? ''],
    domicilio: [this.data.socio?.domicilio ?? ''],
    telefono:  [this.data.socio?.telefono  ?? ''],
  });

  loading = signal(false);
  error   = signal<string | null>(null);

  guardar(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const dto = this.form.value as CreateSocioDto;
    const op$ = this.data.socio
      ? this.sociosService.update(this.data.socio.id, dto)
      : this.sociosService.create(dto);

    op$.subscribe({
      next: () => {
        const msg = this.data.socio ? 'Socio actualizado' : 'Socio creado';
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
