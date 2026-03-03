// Prestamos DTOs
export interface CreatePrestamoDto {
  libro_id: number;
  socio_id: number;
  dias: number;
}

export function validateCreatePrestamoDto(body: unknown): CreatePrestamoDto {
  const b = body as Record<string, unknown>;
  if (!b['libro_id'] || isNaN(Number(b['libro_id']))) {
    throw new Error('libro_id es requerido y debe ser un número');
  }
  if (!b['socio_id'] || isNaN(Number(b['socio_id']))) {
    throw new Error('socio_id es requerido y debe ser un número');
  }
  const dias = Number(b['dias']);
  if (!dias || dias < 1) {
    throw new Error('dias es requerido y debe ser mayor a 0');
  }
  return {
    libro_id: Number(b['libro_id']),
    socio_id: Number(b['socio_id']),
    dias,
  };
}
