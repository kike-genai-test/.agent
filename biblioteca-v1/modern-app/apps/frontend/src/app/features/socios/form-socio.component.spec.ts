import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { FormSocioComponent } from './form-socio.component';
import { SociosService } from '../../core/services/socios.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('FormSocioComponent (create mode)', () => {
  let fixture: ComponentFixture<FormSocioComponent>;
  let component: FormSocioComponent;
  let serviceMock: { create: jest.Mock; update: jest.Mock };
  let dialogRef: { close: jest.Mock };
  let snackOpen: jest.SpyInstance;

  beforeEach(async () => {
    serviceMock = { create: jest.fn(), update: jest.fn() };
    dialogRef   = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [FormSocioComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: SociosService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(FormSocioComponent);
    component = fixture.componentInstance;

    snackOpen = jest.spyOn(fixture.debugElement.injector.get(MatSnackBar), 'open')
      .mockReturnValue(undefined as any);

    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('form is invalid when required fields are empty', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('calls create on guardar with valid form', () => {
    serviceMock.create.mockReturnValue(of({ id: 1, apellidos: 'García', nombres: 'Juan' }));
    component.form.setValue({ apellidos: 'García', nombres: 'Juan', nro_doc: '', domicilio: '', telefono: '' });
    component.guardar();
    expect(serviceMock.create).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('sets error signal on service failure', () => {
    serviceMock.create.mockReturnValue(throwError(() => ({ error: { error: 'Error guardando' } })));
    component.form.setValue({ apellidos: 'García', nombres: 'Juan', nro_doc: '', domicilio: '', telefono: '' });
    component.guardar();
    expect(component.error()).toBe('Error guardando');
    expect(component.loading()).toBe(false);
  });
});

describe('FormSocioComponent (edit mode)', () => {
  let fixture:   ComponentFixture<FormSocioComponent>;
  let component: FormSocioComponent;
  let serviceMock: { create: jest.Mock; update: jest.Mock };

  const existingSocio = { id: 5, apellidos: 'López', nombres: 'Ana', nro_doc: '999', domicilio: 'Calle 5', telefono: '444', activo: 1, created_at: '', updated_at: '' };

  beforeEach(async () => {
    serviceMock = { create: jest.fn(), update: jest.fn().mockReturnValue(of(existingSocio)) };

    await TestBed.configureTestingModule({
      imports: [FormSocioComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: { socio: existingSocio } },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: SociosService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(FormSocioComponent);
    component = fixture.componentInstance;
    jest.spyOn(fixture.debugElement.injector.get(MatSnackBar), 'open').mockReturnValue(undefined as any);
    fixture.detectChanges();
  });

  it('pre-fills form with existing socio data', () => {
    expect(component.form.value.apellidos).toBe('López');
  });

  it('calls update on guardar in edit mode', () => {
    component.guardar();
    expect(serviceMock.update).toHaveBeenCalledWith(5, expect.any(Object));
  });
});
