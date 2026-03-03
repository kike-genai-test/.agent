import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { ListaSociosComponent } from './lista-socios.component';
import { SociosService, Socio } from '../../core/services/socios.service';

const FAKE_SOCIOS: Socio[] = [
  { id: 1, apellidos: 'García', nombres: 'Juan', nro_doc: '12345', domicilio: 'Av 1', telefono: '555', activo: 1, created_at: '', updated_at: '' },
  { id: 2, apellidos: 'López', nombres: 'Ana', nro_doc: '67890', domicilio: 'Calle 2', telefono: '666', activo: 1, created_at: '', updated_at: '' },
];

describe('ListaSociosComponent', () => {
  let fixture:   ComponentFixture<ListaSociosComponent>;
  let component: ListaSociosComponent;
  let serviceMock: { getAll: jest.Mock; delete: jest.Mock };
  let openDialogSpy: jest.SpyInstance;

  beforeEach(async () => {
    serviceMock = { getAll: jest.fn().mockReturnValue(of(FAKE_SOCIOS)), delete: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ListaSociosComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SociosService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture   = TestBed.createComponent(ListaSociosComponent);
    component = fixture.componentInstance;

    const dialog = fixture.debugElement.injector.get(MatDialog);
    openDialogSpy = jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) } as any);

    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('loads socios on init', () => {
    expect(serviceMock.getAll).toHaveBeenCalled();
    expect(component.socios()).toHaveLength(2);
  });

  it('filtrados returns all when busqueda is empty', () => {
    expect(component.filtrados()).toHaveLength(2);
  });

  it('filtrados filters by apellidos', () => {
    component.busqueda.set('garcía');
    expect(component.filtrados()).toHaveLength(1);
    expect(component.filtrados()[0].apellidos).toBe('García');
  });

  it('filtrados filters by nombres', () => {
    component.busqueda.set('ana');
    expect(component.filtrados()).toHaveLength(1);
  });

  it('abrirFormulario opens dialog', () => {
    component.abrirFormulario();
    expect(openDialogSpy).toHaveBeenCalled();
  });

  it('confirmarBaja calls service.delete on confirm', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    serviceMock.delete.mockReturnValue(of(void 0));
    component.confirmarBaja(FAKE_SOCIOS[0]);
    expect(serviceMock.delete).toHaveBeenCalledWith(1);
  });

  it('confirmarBaja does NOT call service.delete when cancelled', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    component.confirmarBaja(FAKE_SOCIOS[0]);
    expect(serviceMock.delete).not.toHaveBeenCalled();
  });
});
