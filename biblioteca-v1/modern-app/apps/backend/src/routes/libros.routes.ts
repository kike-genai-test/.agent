import { Router } from 'express';
import { librosController } from '../controllers/libros.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const librosRoutes = Router();

// All libros routes require authentication
librosRoutes.use(authMiddleware);

// GET /libros?search=&estado=
librosRoutes.get('/', librosController.findAll);
// GET /libros/:id
librosRoutes.get('/:id', librosController.findById);
// POST /libros
librosRoutes.post('/', librosController.create);
// PUT /libros/:id
librosRoutes.put('/:id', librosController.update);
// DELETE /libros/:id (baja lógica)
librosRoutes.delete('/:id', librosController.delete);
// PATCH /libros/:id/devolver
librosRoutes.patch('/:id/devolver', librosController.devolver);
