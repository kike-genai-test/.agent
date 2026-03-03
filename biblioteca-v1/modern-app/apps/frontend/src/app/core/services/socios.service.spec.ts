import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SociosService, Socio } from './socios.service';

const BASE = 'http://localhost:3000';

describe('SociosService (HTTP)', () => {
  let service: SociosService;
  let httpMock: HttpTestingController;

  const fakeSocio: Socio = {
    id: 1, apellidos: 'García', nombres: 'Juan',
    nro_doc: '12345', domicilio: 'Av 1', telefono: '555',
    activo: 1, created_at: '', updated_at: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        SociosService,
      ],
    });
    service  = TestBed.inject(SociosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() sends GET /socios', () => {
    service.getAll().subscribe(data => expect(data).toEqual([fakeSocio]));
    const req = httpMock.expectOne(`${BASE}/socios`);
    expect(req.request.method).toBe('GET');
    req.flush([fakeSocio]);
  });

  it('getAll(search) includes query param', () => {
    service.getAll('García').subscribe();
    const req = httpMock.expectOne(r => r.url === `${BASE}/socios` && r.params.has('search'));
    expect(req.request.params.get('search')).toBe('García');
    req.flush([fakeSocio]);
  });

  it('getById() sends GET /socios/:id', () => {
    service.getById(1).subscribe(data => expect(data).toEqual(fakeSocio));
    const req = httpMock.expectOne(`${BASE}/socios/1`);
    expect(req.request.method).toBe('GET');
    req.flush(fakeSocio);
  });

  it('create() sends POST /socios', () => {
    service.create({ apellidos: 'García', nombres: 'Juan' }).subscribe();
    const req = httpMock.expectOne(`${BASE}/socios`);
    expect(req.request.method).toBe('POST');
    req.flush(fakeSocio);
  });

  it('update() sends PUT /socios/:id', () => {
    service.update(1, { apellidos: 'Nuevo' }).subscribe();
    const req = httpMock.expectOne(`${BASE}/socios/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(fakeSocio);
  });

  it('delete() sends DELETE /socios/:id', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne(`${BASE}/socios/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('getPrestamos() sends GET /socios/:id/prestamos', () => {
    service.getPrestamos(1).subscribe();
    const req = httpMock.expectOne(`${BASE}/socios/1/prestamos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
