import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LibrosService, Libro } from './libros.service';

const BASE = 'http://localhost:3000';

describe('LibrosService (HTTP)', () => {
  let service: LibrosService;
  let httpMock: HttpTestingController;

  const fakeLibro: Libro = {
    id: 1, titulo: 'Don Quijote', autor: 'Cervantes',
    estado: 'disponible', socio_id: null,
    fecha_prestamo: null, fecha_devolucion: null, dias: 0,
    socio_apellidos: null, socio_nombres: null, activo: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        LibrosService,
      ],
    });
    service  = TestBed.inject(LibrosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() sends GET /libros', () => {
    service.getAll().subscribe(d => expect(d).toEqual([fakeLibro]));
    httpMock.expectOne(`${BASE}/libros`).flush([fakeLibro]);
  });

  it('getAll(search) includes search param', () => {
    service.getAll('quijote').subscribe();
    const req = httpMock.expectOne(r => r.url === `${BASE}/libros` && r.params.has('search'));
    req.flush([fakeLibro]);
  });

  it('getAll with estado param', () => {
    service.getAll(undefined, 'disponible').subscribe();
    const req = httpMock.expectOne(r => r.url === `${BASE}/libros` && r.params.has('estado'));
    expect(req.request.params.get('estado')).toBe('disponible');
    req.flush([fakeLibro]);
  });

  it('getById() sends GET /libros/:id', () => {
    service.getById(1).subscribe(d => expect(d).toEqual(fakeLibro));
    httpMock.expectOne(`${BASE}/libros/1`).flush(fakeLibro);
  });

  it('create() sends POST /libros', () => {
    service.create({ titulo: 'Don Quijote', autor: 'Cervantes' }).subscribe();
    const req = httpMock.expectOne(`${BASE}/libros`);
    expect(req.request.method).toBe('POST');
    req.flush(fakeLibro);
  });

  it('update() sends PUT /libros/:id', () => {
    service.update(1, { titulo: 'Nuevo' }).subscribe();
    const req = httpMock.expectOne(`${BASE}/libros/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(fakeLibro);
  });

  it('delete() sends DELETE /libros/:id', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne(`${BASE}/libros/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('devolver() sends PATCH /libros/:id/devolver', () => {
    service.devolver(1).subscribe();
    const req = httpMock.expectOne(`${BASE}/libros/1/devolver`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...fakeLibro, estado: 'disponible' });
  });
});
