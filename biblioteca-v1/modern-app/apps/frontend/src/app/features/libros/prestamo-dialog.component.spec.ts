import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { PrestamoDialogComponent } from './prestamo-dialog.component';
import { PrestamosService } from '../../core/services/prestamos.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Libro } from '../../core/services/libros.service';

const fakeLibro: Libro = {
  id: 3, titulo: 'Hamlet', autor: 'Shakespeare',
  estado: 'disponible', socio_id: null,
  fecha_prestamo: null, fecha_devolucion: null, dias: 0,
  socio_apellidos: null, socio_nombres: null, activo: 1,
};

describe('PrestamoDialogComponent', () => {
  let fixture:   ComponentFixture<PrestamoDialogComponent>;
  let component: PrestamoDialogComponent;
  let serviceMock: { create: jest.Mock };
  let dialogClose: jest.Mock;

  beforeEach(async () => {
    serviceMock = { create: jest.fn() };
    dialogClose = jest.fn();

    await TestBed.configureTestingModule({
      imports: [PrestamoDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: { libro: fakeLibro } },
        { provide: MatDialogRef, useValue: { close: dialogClose } },
        { provide: PrestamosService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(PrestamoDialogComponent);
    component = fixture.componentInstance;
    jest.spyOn(fixture.debugElement.injector.get(MatSnackBar), 'open').mockReturnValue(undefined as any);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should initialize form with libro title visible', () => {
    expect(component.data.libro.titulo).toBe('Hamlet');
  });

  it('form is invalid when socio_id is empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('registrar() calls PrestamosService.create with correct dto', () => {
    serviceMock.create.mockReturnValue(of({}));
    component.form.setValue({ socio_id: 2, dias: 14 });
    component.registrar();
    expect(serviceMock.create).toHaveBeenCalledWith({ libro_id: 3, socio_id: 2, dias: 14 });
    expect(dialogClose).toHaveBeenCalledWith(true);
  });

  it('sets error signal on create failure', () => {
    serviceMock.create.mockReturnValue(throwError(() => ({ error: { error: 'Socio no existe' } })));
    component.form.setValue({ socio_id: 99, dias: 7 });
    component.registrar();
    expect(component.error()).toBe('Socio no existe');
    expect(component.loading()).toBe(false);
  });

  it('registrar() does nothing when form is invalid', () => {
    component.registrar();
    expect(serviceMock.create).not.toHaveBeenCalled();
  });
});
