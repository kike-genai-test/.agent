import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

export const authRoutes = Router();

// POST /auth/login
authRoutes.post('/login', authController.login);
