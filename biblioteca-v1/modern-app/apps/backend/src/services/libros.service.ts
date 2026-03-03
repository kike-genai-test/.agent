import db from "../../db/database";
import type { CreateLibroDto, UpdateLibroDto } from "../dtos/libros.dto";
import { AppError } from "../middleware/error.middleware";
type SQLVal = string | number | bigint | null | Uint8Array;

export class LibrosService {
  findAll(search?: string, estado?: string): unknown[] {
    const conditions: string[] = ["l.activo = 1"];
    const values: SQLVal[] = [];

    if (search) {
      conditions.push("(l.titulo LIKE ? OR l.autor LIKE ?)");
      values.push(`%${search}%`, `%${search}%`);
    }
    if (estado && estado !== "todos") {
      conditions.push("l.estado = ?");
      values.push(estado);
    }

    const where = conditions.join(" AND ");
    return db
      .prepare(
        `
        SELECT
          l.id, l.titulo, l.autor, l.estado,
          l.socio_id, l.fecha_prestamo, l.fecha_devolucion, l.dias,
          s.apellidos AS socio_apellidos,
          s.nombres   AS socio_nombres
        FROM libros l
        LEFT JOIN socios s ON s.id = l.socio_id
        WHERE ${where}
        ORDER BY l.titulo
      `,
      )
      .all(...values);
  }

  findById(id: number): unknown {
    const libro = db
      .prepare(
        `
        SELECT
          l.id, l.titulo, l.autor, l.estado,
          l.socio_id, l.fecha_prestamo, l.fecha_devolucion, l.dias,
          s.apellidos AS socio_apellidos,
          s.nombres   AS socio_nombres
        FROM libros l
        LEFT JOIN socios s ON s.id = l.socio_id
        WHERE l.id = ? AND l.activo = 1
      `,
      )
      .get(id);
    if (!libro) throw new AppError(404, `Libro ${id} no encontrado`);
    return libro;
  }

  create(dto: CreateLibroDto): unknown {
    const result = db
      .prepare("INSERT INTO libros (titulo, autor) VALUES (?, ?)")
      .run(dto.titulo, dto.autor);
    return this.findById(result.lastInsertRowid as number);
  }

  update(id: number, dto: UpdateLibroDto): unknown {
    this.findById(id);

    const fields: string[] = [];
    const values: SQLVal[] = [];

    if (dto.titulo !== undefined) {
      fields.push("titulo = ?");
      values.push(dto.titulo);
    }
    if (dto.autor !== undefined) {
      fields.push("autor = ?");
      values.push(dto.autor);
    }
    if (dto.estado !== undefined) {
      fields.push("estado = ?");
      values.push(dto.estado);
    }
    if (dto.socio_id !== undefined) {
      fields.push("socio_id = ?");
      values.push(dto.socio_id);
    }
    if (dto.fecha_prestamo !== undefined) {
      fields.push("fecha_prestamo = ?");
      values.push(dto.fecha_prestamo);
    }
    if (dto.fecha_devolucion !== undefined) {
      fields.push("fecha_devolucion = ?");
      values.push(dto.fecha_devolucion);
    }
    if (dto.dias !== undefined) {
      fields.push("dias = ?");
      values.push(dto.dias);
    }

    if (fields.length === 0) throw new AppError(400, "Nada que actualizar");

    fields.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE libros SET ${fields.join(", ")} WHERE id = ?`).run(
      ...values,
    );
    return this.findById(id);
  }

  delete(id: number): void {
    this.findById(id);
    db.prepare(
      "UPDATE libros SET activo = 0, updated_at = datetime('now') WHERE id = ?",
    ).run(id);
  }

  devolver(id: number): unknown {
    const libro = this.findById(id) as { estado: string };
    if (libro.estado !== "prestado") {
      throw new AppError(400, "El libro ya está disponible");
    }
    db.prepare(
      `
      UPDATE libros
      SET estado = 'disponible',
          socio_id = NULL,
          fecha_prestamo = NULL,
          fecha_devolucion = NULL,
          dias = 0,
          updated_at = datetime('now')
      WHERE id = ?
    `,
    ).run(id);
    return this.findById(id);
  }
}
