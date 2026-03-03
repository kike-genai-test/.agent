import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ListaLibrosComponent } from './lista-libros.component';
import { LibrosService, Libro } from '../../core/services/libros.service';

const FAKE_LIBROS: Libro[] = [
  { id: 1, titulo: 'Don Quijote', autor: 'Cervantes', estado: 'disponible',
    socio_id: null, fecha_prestamo: null, fecha_devolucion: null, dias: 0,
    socio_apellidos: null, socio_nombres: null, activo: 1 },
  { id: 2, titulo: 'Hamlet', autor: 'Shakespeare', estado: 'prestado',
    socio_id: 3, fecha_prestamo: '2024-01-01', fecha_devolucion: '2024-01-15', dias: 14,
    socio_apellidos: 'García', socio_nombres: 'Juan', activo: 1 },
];

describe('ListaLibrosComponent', () => {
  let fixture:   ComponentFixture<ListaLibrosComponent>;
  let component: ListaLibrosComponent;
  let serviceMock: { getAll: jest.Mock; delete: jest.Mock; devolver: jest.Mock };
  let openDialogSpy: jest.SpyInstance;

  beforeEach(async () => {
    serviceMock = {
      getAll:   jest.fn().mockReturnValue(of(FAKE_LIBROS)),
      delete:   jest.fn().mockReturnValue(of(void 0)),
      devolver: jest.fn().mockReturnValue(of(void 0)),
    };

    await TestBed.configureTestingModule({
      imports: [ListaLibrosComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: LibrosService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(ListaLibrosComponent);
    component = fixture.componentInstance;

    // Spy on the component's own dialog instance
    const dialog = fixture.debugElement.injector.get(MatDialog);
    openDialogSpy = jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) } as any);

    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('loads libros on init', () => {
    expect(serviceMock.getAll).toHaveBeenCalled();
    expect(component.libros()).toHaveLength(2);
  });

  it('filtrados() returns all when no filter', () => {
    expect(component.filtrados()).toHaveLength(2);
  });

  it('filtrados() filters by titulo', () => {
    component.busqueda.set('quijote');
    expect(component.filtrados()).toHaveLength(1);
  });

  it('filtrados() filters by estado', () => {
    component.estadoFiltroSignal.set('disponible');
    expect(component.filtrados()).toHaveLength(1);
    expect(component.filtrados()[0].estado).toBe('disponible');
  });

  it('filtrados() filters prestado', () => {
    component.estadoFiltroSignal.set('prestado');
    expect(component.filtrados()).toHaveLength(1);
    expect(component.filtrados()[0].estado).toBe('prestado');
  });

  it('togglePrestamo opens dialog for disponible libro', () => {
    component.togglePrestamo(FAKE_LIBROS[0]); // estado = disponible
    expect(openDialogSpy).toHaveBeenCalled();
  });

  it('togglePrestamo calls devolver for prestado libro on confirm', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    component.togglePrestamo(FAKE_LIBROS[1]); // estado = prestado
    expect(serviceMock.devolver).toHaveBeenCalledWith(2);
  });

  it('togglePrestamo does NOT call devolver when confirm is cancelled', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    component.togglePrestamo(FAKE_LIBROS[1]);
    expect(serviceMock.devolver).not.toHaveBeenCalled();
  });

  it('confirmarEliminar calls service.delete on confirm', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    component.confirmarEliminar(FAKE_LIBROS[0]);
    expect(serviceMock.delete).toHaveBeenCalledWith(1);
  });
});
