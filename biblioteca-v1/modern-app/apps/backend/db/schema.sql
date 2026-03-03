-- =============================================================================
-- BIBLIOTECA — SQLite Schema
-- Migrado desde: MS Access (biblioteca.mdb)
-- Agente: db-migration-architect
-- =============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- Clean slate (order matters: dependents first)
DROP TABLE IF EXISTS libros;
DROP TABLE IF EXISTS socios;
DROP TABLE IF EXISTS usuarios;

-- =============================================================================
-- TABLA: usuarios
-- Reemplaza la tabla Access "clave" (password en texto plano)
-- Autenticación con bcrypt + JWT
-- =============================================================================
CREATE TABLE usuarios (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT    NOT NULL UNIQUE,
  password   TEXT    NOT NULL,           -- bcrypt hash
  rol        TEXT    NOT NULL DEFAULT 'admin' CHECK(rol IN ('admin', 'operador')),
  activo     INTEGER NOT NULL DEFAULT 1  CHECK(activo IN (0, 1)),
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- TABLA: socios
-- Mapea la tabla Access "cliente"
-- Columnas renombradas a snake_case / sin caracteres especiales
-- =============================================================================
CREATE TABLE socios (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  apellidos  TEXT    NOT NULL,
  nombres    TEXT    NOT NULL,
  nro_doc    TEXT,                        -- "NºDoc" original
  domicilio  TEXT,
  telefono   TEXT,
  activo     INTEGER NOT NULL DEFAULT 1  CHECK(activo IN (0, 1)),
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- =============================================================================
-- TABLA: libros
-- Mapea la tabla Access "libros"
-- Estado normalizado: 'disponible' | 'prestado'  (era 'Si'/'No')
-- =============================================================================
CREATE TABLE libros (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo        TEXT    NOT NULL,
  autor         TEXT    NOT NULL,
  estado        TEXT    NOT NULL DEFAULT 'disponible'
                  CHECK(estado IN ('disponible', 'prestado')),
  socio_id      INTEGER,                  -- FK a socios.id (NULL cuando disponible)
  fecha_prestamo TEXT,                    -- ISO 8601 YYYY-MM-DD
  fecha_devolucion TEXT,                  -- ISO 8601 YYYY-MM-DD
  dias          INTEGER DEFAULT 0,
  activo        INTEGER NOT NULL DEFAULT 1 CHECK(activo IN (0, 1)),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (socio_id) REFERENCES socios(id) ON DELETE SET NULL
);

-- =============================================================================
-- Índices para búsquedas frecuentes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_socios_apellidos ON socios(apellidos);
CREATE INDEX IF NOT EXISTS idx_socios_activo    ON socios(activo);
CREATE INDEX IF NOT EXISTS idx_libros_titulo    ON libros(titulo);
CREATE INDEX IF NOT EXISTS idx_libros_autor     ON libros(autor);
CREATE INDEX IF NOT EXISTS idx_libros_estado    ON libros(estado);
CREATE INDEX IF NOT EXISTS idx_libros_activo    ON libros(activo);
CREATE INDEX IF NOT EXISTS idx_libros_socio_id  ON libros(socio_id);
