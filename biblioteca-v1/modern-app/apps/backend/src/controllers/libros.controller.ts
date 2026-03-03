import type { Request, Response, NextFunction } from 'express';
import { LibrosService } from '../services/libros.service';
import { validateCreateLibroDto, validateUpdateLibroDto } from '../dtos/libros.dto';

const librosService = new LibrosService();

export const librosController = {
  findAll(req: Request, res: Response, next: NextFunction): void {
    try {
      const search = typeof req.query['search'] === 'string' ? req.query['search'] : undefined;
      const estado = typeof req.query['estado'] === 'string' ? req.query['estado'] : undefined;
      res.json(librosService.findAll(search, estado));
    } catch (err) { next(err); }
  },

  findById(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(librosService.findById(Number(req.params['id'])));
    } catch (err) { next(err); }
  },

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const dto = validateCreateLibroDto(req.body);
      res.status(201).json(librosService.create(dto));
    } catch (err) { next(err); }
  },

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      const dto = validateUpdateLibroDto(req.body);
      res.json(librosService.update(Number(req.params['id']), dto));
    } catch (err) { next(err); }
  },

  delete(req: Request, res: Response, next: NextFunction): void {
    try {
      librosService.delete(Number(req.params['id']));
      res.status(204).send();
    } catch (err) { next(err); }
  },

  devolver(req: Request, res: Response, next: NextFunction): void {
    try {
      res.json(librosService.devolver(Number(req.params['id'])));
    } catch (err) { next(err); }
  },
};
