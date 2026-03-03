// Socios DTOs
export interface CreateSocioDto {
  apellidos: string;
  nombres: string;
  nro_doc?: string;
  domicilio?: string;
  telefono?: string;
}

export interface UpdateSocioDto extends Partial<CreateSocioDto> {}

export function validateCreateSocioDto(body: unknown): CreateSocioDto {
  const b = body as Record<string, unknown>;
  if (!b['apellidos'] || typeof b['apellidos'] !== 'string') {
    throw new Error('apellidos es requerido');
  }
  if (!b['nombres'] || typeof b['nombres'] !== 'string') {
    throw new Error('nombres es requerido');
  }
  return {
    apellidos: b['apellidos'],
    nombres:   b['nombres'],
    nro_doc:   typeof b['nro_doc']   === 'string' ? b['nro_doc']   : undefined,
    domicilio: typeof b['domicilio'] === 'string' ? b['domicilio'] : undefined,
    telefono:  typeof b['telefono']  === 'string' ? b['telefono']  : undefined,
  };
}

export function validateUpdateSocioDto(body: unknown): UpdateSocioDto {
  const b = body as Record<string, unknown>;
  const dto: UpdateSocioDto = {};
  if (b['apellidos'] !== undefined) dto.apellidos = String(b['apellidos']);
  if (b['nombres']   !== undefined) dto.nombres   = String(b['nombres']);
  if (b['nro_doc']   !== undefined) dto.nro_doc   = String(b['nro_doc']);
  if (b['domicilio'] !== undefined) dto.domicilio = String(b['domicilio']);
  if (b['telefono']  !== undefined) dto.telefono  = String(b['telefono']);
  return dto;
}
