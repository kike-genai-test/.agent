import type { Request, Response, NextFunction } from 'express';
import { PrestamosService } from '../services/prestamos.service';
import { validateCreatePrestamoDto } from '../dtos/prestamos.dto';

const prestamosService = new PrestamosService();

export const prestamosController = {
  findAll(_req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(prestamosService.findAll());
    } catch (err) { next(err); }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const dto = validateCreatePrestamoDto(req.body);
      res.status(201).json(prestamosService.create(dto));
    } catch (err) { next(err); }
  },
};
