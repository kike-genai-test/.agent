import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API_URL = 'http://localhost:3000';

export interface CreatePrestamoDto {
  libro_id: number;
  socio_id: number;
  dias: number;
}

@Injectable({ providedIn: 'root' })
export class PrestamosService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<unknown[]>(`${API_URL}/prestamos`);
  }

  create(dto: CreatePrestamoDto) {
    return this.http.post<unknown>(`${API_URL}/prestamos`, dto);
  }
}
