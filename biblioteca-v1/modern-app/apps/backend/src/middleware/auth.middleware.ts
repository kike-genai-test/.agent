import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'biblioteca-secret-key-2024';

export interface AuthRequest extends Request {
  userId?: number;
  userRol?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; rol: string };
    req.userId = payload.userId;
    req.userRol = payload.rol;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
