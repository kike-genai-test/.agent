import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { validateLoginDto } from '../dtos/auth.dto';

const authService = new AuthService();

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = validateLoginDto(req.body);
      const result = await authService.login(dto);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
