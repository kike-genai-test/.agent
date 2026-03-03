import db from "../../db/database";
import type { CreateSocioDto, UpdateSocioDto } from "../dtos/socios.dto";
import { AppError } from "../middleware/error.middleware";
type SQLVal = string | number | bigint | null | Uint8Array;

export class SociosService {
  findAll(search?: string): unknown[] {
    if (search) {
      return db
        .prepare(
          `
          SELECT id, apellidos, nombres, nro_doc, domicilio, telefono, activo, created_at, updated_at
          FROM socios
          WHERE activo = 1
            AND (apellidos LIKE ? OR nombres LIKE ?)
          ORDER BY apellidos, nombres
        `,
        )
        .all(`%${search}%`, `%${search}%`);
    }
    return db
      .prepare(
        `
        SELECT id, apellidos, nombres, nro_doc, domicilio, telefono, activo, created_at, updated_at
        FROM socios
        WHERE activo = 1
        ORDER BY apellidos, nombres
      `,
      )
      .all();
  }

  findById(id: number): unknown {
    const socio = db
      .prepare("SELECT * FROM socios WHERE id = ? AND activo = 1")
      .get(id);
    if (!socio) throw new AppError(404, `Socio ${id} no encontrado`);
    return socio;
  }

  create(dto: CreateSocioDto): unknown {
    const result = db
      .prepare(
        `
        INSERT INTO socios (apellidos, nombres, nro_doc, domicilio, telefono)
        VALUES (?, ?, ?, ?, ?)
      `,
      )
      .run(
        dto.apellidos,
        dto.nombres,
        dto.nro_doc ?? null,
        dto.domicilio ?? null,
        dto.telefono ?? null,
      );

    return this.findById(result.lastInsertRowid as number);
  }

  update(id: number, dto: UpdateSocioDto): unknown {
    this.findById(id); // throws 404 if not found

    const fields: string[] = [];
    const values: SQLVal[] = [];

    if (dto.apellidos !== undefined) {
      fields.push("apellidos = ?");
      values.push(dto.apellidos);
    }
    if (dto.nombres !== undefined) {
      fields.push("nombres = ?");
      values.push(dto.nombres);
    }
    if (dto.nro_doc !== undefined) {
      fields.push("nro_doc = ?");
      values.push(dto.nro_doc);
    }
    if (dto.domicilio !== undefined) {
      fields.push("domicilio = ?");
      values.push(dto.domicilio);
    }
    if (dto.telefono !== undefined) {
      fields.push("telefono = ?");
      values.push(dto.telefono);
    }

    if (fields.length === 0) throw new AppError(400, "Nada que actualizar");

    fields.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE socios SET ${fields.join(", ")} WHERE id = ?`).run(
      ...values,
    );
    return this.findById(id);
  }

  delete(id: number): void {
    this.findById(id); // throws 404 if not found
    db.prepare(
      "UPDATE socios SET activo = 0, updated_at = datetime('now') WHERE id = ?",
    ).run(id);
  }

  getPrestamosActivos(id: number): unknown[] {
    this.findById(id);
    return db
      .prepare(
        `
        SELECT l.id, l.titulo, l.autor, l.fecha_prestamo, l.fecha_devolucion, l.dias
        FROM libros l
        WHERE l.socio_id = ? AND l.estado = 'prestado' AND l.activo = 1
        ORDER BY l.fecha_prestamo DESC
      `,
      )
      .all(id);
  }
}
