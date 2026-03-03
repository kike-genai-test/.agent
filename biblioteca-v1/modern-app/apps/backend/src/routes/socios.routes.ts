import { Router } from 'express';
import { sociosController } from '../controllers/socios.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const sociosRoutes = Router();

// All socios routes require authentication
sociosRoutes.use(authMiddleware);

// GET /socios?search=
sociosRoutes.get('/', sociosController.findAll);
// GET /socios/:id
sociosRoutes.get('/:id', sociosController.findById);
// POST /socios
sociosRoutes.post('/', sociosController.create);
// PUT /socios/:id
sociosRoutes.put('/:id', sociosController.update);
// DELETE /socios/:id (baja lógica)
sociosRoutes.delete('/:id', sociosController.delete);
// GET /socios/:id/prestamos
sociosRoutes.get('/:id/prestamos', sociosController.getPrestamos);
