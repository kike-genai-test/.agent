import type { Request, Response, NextFunction } from 'express';
import { SociosService } from '../services/socios.service';
import { validateCreateSocioDto, validateUpdateSocioDto } from '../dtos/socios.dto';

const sociosService = new SociosService();

export const sociosController = {
  findAll(req: Request, res: Response, next: NextFunction): void {
    try {
      const search = typeof req.query['search'] === 'string' ? req.query['search'] : undefined;
      res.json(sociosService.findAll(search));
    } catch (err) { next(err); }
  },

  findById(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(sociosService.findById(Number(req.params['id'])));
    } catch (err) { next(err); }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const dto = validateCreateSocioDto(req.body);
      res.status(201).json(sociosService.create(dto));
    } catch (err) { next(err); }
  },

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      const dto = validateUpdateSocioDto(req.body);
      res.json(sociosService.update(Number(req.params['id']), dto));
    } catch (err) { next(err); }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      sociosService.delete(Number(req.params['id']));
      res.status(204).send();
    } catch (err) { next(err); }
  },

  getPrestamos(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(sociosService.getPrestamosActivos(Number(req.params['id'])));
    } catch (err) { next(err); }
  },
};
