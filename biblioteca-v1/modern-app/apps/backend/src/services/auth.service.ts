import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../db/database';
import type { LoginDto, LoginResponseDto } from '../dtos/auth.dto';
import { AppError } from '../middleware/error.middleware';

const JWT_SECRET  = process.env['JWT_SECRET']  ?? 'biblioteca-secret-key-2024';
const JWT_EXPIRES = process.env['JWT_EXPIRES']  ?? '8h';

interface UsuarioRow {
  id: number;
  username: string;
  password: string;
  rol: string;
  activo: number;
}

export class AuthService {
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const usuario = db
      .prepare('SELECT * FROM usuarios WHERE username = ? AND activo = 1')
      .get(dto.username) as UsuarioRow | undefined;

    if (!usuario) {
      throw new AppError(401, 'Credenciales inválidas');
    }

    const valid = await bcrypt.compare(dto.password, usuario.password);
    if (!valid) {
      throw new AppError(401, 'Credenciales inválidas');
    }

    const token = jwt.sign(
      { userId: usuario.id, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES } as jwt.SignOptions
    );

    return {
      token,
      usuario: { id: usuario.id, username: usuario.username, rol: usuario.rol },
    };
  }
}
