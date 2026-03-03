// Auth DTOs
export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  usuario: {
    id: number;
    username: string;
    rol: string;
  };
}

export function validateLoginDto(body: unknown): LoginDto {
  const b = body as Record<string, unknown>;
  if (!b['username'] || typeof b['username'] !== 'string') {
    throw new Error('username es requerido');
  }
  if (!b['password'] || typeof b['password'] !== 'string') {
    throw new Error('password es requerido');
  }
  return { username: b['username'], password: b['password'] };
}
