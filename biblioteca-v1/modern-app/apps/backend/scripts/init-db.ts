/**
 * init-db.ts
 * Initialises the SQLite database: applies schema + inserts seed data.
 * Hashes are generated at runtime so they are always valid.
 *
 * Usage:  npx tsx scripts/init-db.ts
 *         npm run init-db
 */

import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(__dirname, "..", "db", "database.db");
const SCHEMA_PATH = path.join(__dirname, "..", "db", "schema.sql");

// ---------------------------------------------------------------------------
// Open / create the database
// ---------------------------------------------------------------------------
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = OFF"); // disable while we recreate tables

// ---------------------------------------------------------------------------
// Apply schema (drops + creates tables)
// ---------------------------------------------------------------------------
const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
db.exec(schema);
console.log("✅ Schema applied");

db.exec("PRAGMA foreign_keys = ON");

// ---------------------------------------------------------------------------
// Generate password hashes at runtime (always valid)
// ---------------------------------------------------------------------------
const ROUNDS = 10;
const adminHash = bcrypt.hashSync("admin123", ROUNDS);
const operadorHash = bcrypt.hashSync("operador123", ROUNDS);

console.log("🔑 Hashes generated");

// ---------------------------------------------------------------------------
// Seed: usuarios
// ---------------------------------------------------------------------------
db.prepare(
  `
  INSERT OR IGNORE INTO usuarios (username, password, rol, activo)
  VALUES (?, ?, ?, 1)
`,
).run("admin", adminHash, "admin");

db.prepare(
  `
  INSERT OR IGNORE INTO usuarios (username, password, rol, activo)
  VALUES (?, ?, ?, 1)
`,
).run("operador1", operadorHash, "operador");

console.log(
  "✅ Usuarios inserted  (admin / admin123, operador1 / operador123)",
);

// ---------------------------------------------------------------------------
// Seed: socios
// ---------------------------------------------------------------------------
const insertSocio = db.prepare(`
  INSERT OR IGNORE INTO socios (apellidos, nombres, nro_doc, domicilio, telefono, activo)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const socios = [
  [
    "García",
    "Juan Carlos",
    "28341256",
    "Av. Corrientes 1234, CABA",
    "011-4523-8901",
    1,
  ],
  [
    "Fernández",
    "María Laura",
    "31567890",
    "Calle Mitre 567, Buenos Aires",
    "011-4612-3456",
    1,
  ],
  [
    "López",
    "Roberto Ariel",
    "25789012",
    "Rivadavia 890, Palermo",
    "011-4789-2345",
    1,
  ],
  [
    "Martínez",
    "Ana Sofía",
    "38901234",
    "Callao 234, Balvanera",
    "011-4567-8901",
    1,
  ],
  [
    "Rodríguez",
    "Carlos Eduardo",
    "22345678",
    "Santa Fe 1890, Recoleta",
    "011-4890-1234",
    1,
  ],
  [
    "Pérez",
    "Lucía Valentina",
    "41234567",
    "Corrientes 3456, Almagro",
    "011-4234-5678",
    0,
  ],
] as const;

for (const s of socios) insertSocio.run(...s);
console.log(`✅ Socios inserted (${socios.length})`);

// ---------------------------------------------------------------------------
// Seed: libros
// ---------------------------------------------------------------------------
const insertLibro = db.prepare(`
  INSERT OR IGNORE INTO libros (titulo, autor, estado, socio_id, fecha_prestamo, fecha_devolucion, dias, activo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const libros = [
  ["El Aleph", "Jorge Luis Borges", "disponible", null, null, null, 0, 1],
  [
    "Cien años de soledad",
    "Gabriel García Márquez",
    "disponible",
    null,
    null,
    null,
    0,
    1,
  ],
  [
    "Don Quijote de la Mancha",
    "Miguel de Cervantes",
    "disponible",
    null,
    null,
    null,
    0,
    1,
  ],
  [
    "La casa de los espíritus",
    "Isabel Allende",
    "prestado",
    1,
    "2026-02-15",
    "2026-03-15",
    28,
    1,
  ],
  [
    "Ficciones",
    "Jorge Luis Borges",
    "prestado",
    2,
    "2026-02-20",
    "2026-03-05",
    13,
    1,
  ],
  ["Rayuela", "Julio Cortázar", "disponible", null, null, null, 0, 1],
  [
    "La ciudad y los perros",
    "Mario Vargas Llosa",
    "disponible",
    null,
    null,
    null,
    0,
    1,
  ],
  [
    "Crónica de una muerte anunciada",
    "Gabriel García Márquez",
    "prestado",
    3,
    "2026-02-25",
    "2026-03-10",
    13,
    1,
  ],
  ["El túnel", "Ernesto Sábato", "disponible", null, null, null, 0, 1],
  [
    "Sobre héroes y tumbas",
    "Ernesto Sábato",
    "disponible",
    null,
    null,
    null,
    0,
    1,
  ],
  [
    "Manual del distraído",
    "Alejandro Rossi",
    "disponible",
    null,
    null,
    null,
    0,
    1,
  ],
  [
    "El señor de los anillos",
    "J.R.R. Tolkien",
    "prestado",
    4,
    "2026-03-01",
    "2026-03-21",
    20,
    1,
  ],
] as const;

for (const l of libros) insertLibro.run(...l);
console.log(`✅ Libros inserted (${libros.length})`);

// ---------------------------------------------------------------------------
db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
console.log("\n🎉 Database initialised successfully!");
console.log(`   Path: ${DB_PATH}`);
console.log("   Credentials:  admin / admin123  |  operador1 / operador123");
