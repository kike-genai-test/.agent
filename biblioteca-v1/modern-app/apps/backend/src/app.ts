import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';
import { sociosRoutes } from './routes/socios.routes';
import { librosRoutes } from './routes/libros.routes';
import { prestamosRoutes } from './routes/prestamos.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { logger } from './logger';

const app = express();
const PORT = process.env['PORT'] ?? 3000;

// Middleware
app.use(cors({
  origin: process.env['FRONTEND_URL'] ?? 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/socios', sociosRoutes);
app.use('/libros', librosRoutes);
app.use('/prestamos', prestamosRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling (must be last)
app.use(errorMiddleware);

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Biblioteca API server started');
});

export default app;
