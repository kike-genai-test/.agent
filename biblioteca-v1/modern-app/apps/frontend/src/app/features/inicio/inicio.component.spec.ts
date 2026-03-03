import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { InicioComponent } from './inicio.component';
import { SociosService } from '../../core/services/socios.service';
import { LibrosService, Libro } from '../../core/services/libros.service';
import { PrestamosService } from '../../core/services/prestamos.service';

const FAKE_SOCIOS = [{ id: 1 }, { id: 2 }, { id: 3 }];
const FAKE_LIBROS: Partial<Libro>[] = [
  { id: 1, estado: 'disponible' },
  { id: 2, estado: 'disponible' },
  { id: 3, estado: 'prestado' },
];

describe('InicioComponent', () => {
  let fixture:   ComponentFixture<InicioComponent>;
  let component: InicioComponent;
  let sociosMock:   { getAll: jest.Mock };
  let librosMock:   { getAll: jest.Mock };
  let prestamosMock: { getAll: jest.Mock };

  beforeEach(async () => {
    sociosMock    = { getAll: jest.fn().mockReturnValue(of(FAKE_SOCIOS)) };
    librosMock    = { getAll: jest.fn().mockReturnValue(of(FAKE_LIBROS)) };
    prestamosMock = { getAll: jest.fn().mockReturnValue(of([])) };

    await TestBed.configureTestingModule({
      imports: [InicioComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideRouter([]),
        { provide: SociosService,    useValue: sociosMock },
        { provide: LibrosService,    useValue: librosMock },
        { provide: PrestamosService, useValue: prestamosMock },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(InicioComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => expect(component).toBeTruthy());

  it('loads stats on init', () => {
    fixture.detectChanges(); // triggers ngOnInit
    expect(component.totalSocios()).toBe(3);
    expect(component.totalLibros()).toBe(3);
    expect(component.librosDisponibles()).toBe(2);
    expect(component.librosPrestados()).toBe(1);
  });

  it('calls all 3 services on init', () => {
    fixture.detectChanges();
    expect(sociosMock.getAll).toHaveBeenCalled();
    expect(librosMock.getAll).toHaveBeenCalled();
    expect(prestamosMock.getAll).toHaveBeenCalled();
  });
});
