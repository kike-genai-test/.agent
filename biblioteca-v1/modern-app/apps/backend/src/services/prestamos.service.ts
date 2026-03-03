import db from '../../db/database';
import type { CreatePrestamoDto } from '../dtos/prestamos.dto';
import { AppError } from '../middleware/error.middleware';

interface LibroRow {
  id: number;
  estado: string;
  activo: number;
}
interface SocioRow {
  id: number;
  activo: number;
}

export class PrestamosService {
  create(dto: CreatePrestamoDto): unknown {
    // Verify libro exists and is available
    const libro = db.prepare('SELECT id, estado, activo FROM libros WHERE id = ?').get(dto.libro_id) as LibroRow | undefined;
    if (!libro || !libro.activo) throw new AppError(404, `Libro ${dto.libro_id} no encontrado`);
    if (libro.estado !== 'disponible') throw new AppError(400, 'El libro no está disponible para préstamo');

    // Verify socio exists and is active
    const socio = db.prepare('SELECT id, activo FROM socios WHERE id = ?').get(dto.socio_id) as SocioRow | undefined;
    if (!socio || !socio.activo) throw new AppError(404, `Socio ${dto.socio_id} no encontrado`);

    // Check pending loans (max 3 books per socio - business rule from VB6)
    const pendientes = db
      .prepare("SELECT COUNT(*) as cnt FROM libros WHERE socio_id = ? AND estado = 'prestado'")
      .get(dto.socio_id) as { cnt: number };
    if (pendientes.cnt >= 3) {
      throw new AppError(400, `El socio tiene ${pendientes.cnt} libro(s) sin devolver. Máximo: 3`);
    }

    // Calculate dates
    const today    = new Date();
    const devDate  = new Date(today);
    devDate.setDate(devDate.getDate() + dto.dias);

    const fechaPrestamo   = today.toISOString().split('T')[0];       // YYYY-MM-DD
    const fechaDevolucion = devDate.toISOString().split('T')[0];     // YYYY-MM-DD

    // Register loan atomically
    db.prepare(`
      UPDATE libros
      SET estado = 'prestado',
          socio_id = ?,
          fecha_prestamo = ?,
          fecha_devolucion = ?,
          dias = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(dto.socio_id, fechaPrestamo, fechaDevolucion, dto.dias, dto.libro_id);

    return db
      .prepare(`
        SELECT
          l.id, l.titulo, l.autor, l.estado,
          l.socio_id, l.fecha_prestamo, l.fecha_devolucion, l.dias,
          s.apellidos AS socio_apellidos,
          s.nombres   AS socio_nombres
        FROM libros l
        LEFT JOIN socios s ON s.id = l.socio_id
        WHERE l.id = ?
      `)
      .get(dto.libro_id);
  }

  findAll(): unknown[] {
    return db
      .prepare(`
        SELECT
          l.id AS libro_id,
          l.titulo, l.autor, l.estado,
          l.fecha_prestamo, l.fecha_devolucion, l.dias,
          s.id   AS socio_id,
          s.apellidos, s.nombres
        FROM libros l
        INNER JOIN socios s ON s.id = l.socio_id
        WHERE l.estado = 'prestado' AND l.activo = 1
        ORDER BY l.fecha_prestamo DESC
      `)
      .all();
  }
}
