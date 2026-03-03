import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PrestamosService, CreatePrestamoDto } from './prestamos.service';

const BASE = 'http://localhost:3000';

describe('PrestamosService (HTTP)', () => {
  let service: PrestamosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        PrestamosService,
      ],
    });
    service  = TestBed.inject(PrestamosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() sends GET /prestamos', () => {
    service.getAll().subscribe(d => expect(Array.isArray(d)).toBe(true));
    const req = httpMock.expectOne(`${BASE}/prestamos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('create() sends POST /prestamos', () => {
    const dto: CreatePrestamoDto = { libro_id: 1, socio_id: 2, dias: 14 };
    service.create(dto).subscribe();
    const req = httpMock.expectOne(`${BASE}/prestamos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({});
  });
});
