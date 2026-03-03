import { Router } from 'express';
import { prestamosController } from '../controllers/prestamos.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export const prestamosRoutes = Router();

// All prestamos routes require authentication
prestamosRoutes.use(authMiddleware);

// GET /prestamos (all active loans)
prestamosRoutes.get('/', prestamosController.findAll);
// POST /prestamos (register new loan)
prestamosRoutes.post('/', prestamosController.create);
