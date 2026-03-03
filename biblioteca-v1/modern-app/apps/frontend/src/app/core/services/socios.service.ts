import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const API_URL = 'http://localhost:3000';

export interface Socio {
  id: number;
  apellidos: string;
  nombres: string;
  nro_doc: string | null;
  domicilio: string | null;
  telefono: string | null;
  activo: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSocioDto {
  apellidos: string;
  nombres: string;
  nro_doc?: string;
  domicilio?: string;
  telefono?: string;
}

@Injectable({ providedIn: 'root' })
export class SociosService {
  constructor(private http: HttpClient) {}

  getAll(search?: string) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<Socio[]>(`${API_URL}/socios`, { params });
  }

  getById(id: number) {
    return this.http.get<Socio>(`${API_URL}/socios/${id}`);
  }

  create(dto: CreateSocioDto) {
    return this.http.post<Socio>(`${API_URL}/socios`, dto);
  }

  update(id: number, dto: Partial<CreateSocioDto>) {
    return this.http.put<Socio>(`${API_URL}/socios/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete(`${API_URL}/socios/${id}`);
  }

  getPrestamos(id: number) {
    return this.http.get<unknown[]>(`${API_URL}/socios/${id}/prestamos`);
  }
}
