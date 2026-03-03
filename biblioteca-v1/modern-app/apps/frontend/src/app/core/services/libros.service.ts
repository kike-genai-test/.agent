import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const API_URL = 'http://localhost:3000';

export interface Libro {
  id: number;
  titulo: string;
  autor: string;
  estado: 'disponible' | 'prestado';
  socio_id: number | null;
  fecha_prestamo: string | null;
  fecha_devolucion: string | null;
  dias: number;
  socio_apellidos: string | null;
  socio_nombres: string | null;
  activo: number;
}

export interface CreateLibroDto {
  titulo: string;
  autor: string;
}

@Injectable({ providedIn: 'root' })
export class LibrosService {
  constructor(private http: HttpClient) {}

  getAll(search?: string, estado?: string) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (estado) params = params.set('estado', estado);
    return this.http.get<Libro[]>(`${API_URL}/libros`, { params });
  }

  getById(id: number) {
    return this.http.get<Libro>(`${API_URL}/libros/${id}`);
  }

  create(dto: CreateLibroDto) {
    return this.http.post<Libro>(`${API_URL}/libros`, dto);
  }

  update(id: number, dto: Partial<CreateLibroDto>) {
    return this.http.put<Libro>(`${API_URL}/libros/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete(`${API_URL}/libros/${id}`);
  }

  devolver(id: number) {
    return this.http.patch<Libro>(`${API_URL}/libros/${id}/devolver`, {});
  }
}
