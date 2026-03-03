// Libros DTOs
export interface CreateLibroDto {
  titulo: string;
  autor: string;
}

export interface UpdateLibroDto {
  titulo?: string;
  autor?: string;
  estado?: 'disponible' | 'prestado';
  socio_id?: number | null;
  fecha_prestamo?: string | null;
  fecha_devolucion?: string | null;
  dias?: number;
}

export function validateCreateLibroDto(body: unknown): CreateLibroDto {
  const b = body as Record<string, unknown>;
  if (!b['titulo'] || typeof b['titulo'] !== 'string') {
    throw new Error('titulo es requerido');
  }
  if (!b['autor'] || typeof b['autor'] !== 'string') {
    throw new Error('autor es requerido');
  }
  return { titulo: b['titulo'], autor: b['autor'] };
}

export function validateUpdateLibroDto(body: unknown): UpdateLibroDto {
  const b = body as Record<string, unknown>;
  const dto: UpdateLibroDto = {};
  if (b['titulo']           !== undefined) dto.titulo           = String(b['titulo']);
  if (b['autor']            !== undefined) dto.autor            = String(b['autor']);
  if (b['estado']           !== undefined) dto.estado           = b['estado'] as 'disponible' | 'prestado';
  if (b['socio_id']         !== undefined) dto.socio_id         = b['socio_id'] === null ? null : Number(b['socio_id']);
  if (b['fecha_prestamo']   !== undefined) dto.fecha_prestamo   = b['fecha_prestamo'] as string | null;
  if (b['fecha_devolucion'] !== undefined) dto.fecha_devolucion = b['fecha_devolucion'] as string | null;
  if (b['dias']             !== undefined) dto.dias             = Number(b['dias']);
  return dto;
}
