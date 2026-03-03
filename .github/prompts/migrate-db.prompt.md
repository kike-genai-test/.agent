---
agent: 'agent'
description: 'Migración de MS Access a SQLite con raw SQL. Sin Prisma. Totalmente automatizado.'
---

# Migrate DB — Migración de Base de Datos

Actúa como el agente `db-migration-architect` (instrucciones en `.github/instructions/db-migration-architect.instructions.md`).

Migra el esquema de MS Access (`biblioteca.mdb`) a SQLite con raw SQL. **Sin Prisma.**
Migra **TODAS las tablas** — sin muestras parciales.

---

## Pre-requisitos

Los siguientes archivos deben existir (ejecuta `#audit-legacy` primero si no):
- `biblioteca-v1/analysis/inventory.json`
- `biblioteca-v1/analysis/schema.json`
- `biblioteca-v1/analysis/VB6_DATABASE.md`

---

## Step 1 — Análisis del esquema legacy

Lee `biblioteca-v1/analysis/schema.json` y `biblioteca-v1/analysis/VB6_DATABASE.md`.  
Determina: número de tablas, orden de creación por Foreign Keys, datos de seed necesarios.

---

## Step 2 — Generar schema.sql

Genera `biblioteca-v1/modern-app/apps/backend/db/schema.sql` con:
- `PRAGMA foreign_keys = ON;` al inicio
- `DROP TABLE IF EXISTS` + `CREATE TABLE` para **TODAS** las tablas
- `FOREIGN KEY` constraints
- `CHECK` constraints para booleanos (`INTEGER CHECK(col IN (0,1))`)
- `AUTOINCREMENT` para todos los IDs primarios

### Mapa de tipos obligatorio
| MS Access / VB6 | SQLite |
|-----------------|--------|
| AutoNumber | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| Long / Integer | `INTEGER` |
| Double / Single | `REAL` |
| String / Text / Memo | `TEXT` |
| Date / Time | `TEXT` (ISO 8601) |
| Currency | `REAL` |
| Boolean / Bit | `INTEGER CHECK(col IN (0,1))` |

---

## Step 3 — Generar seed.sql y database.ts

- `seed.sql`: datos de prueba suficientes para testing inmediato
- `database.ts`: singleton SQLite con `better-sqlite3`, `foreign_keys = ON`, `journal_mode = WAL`

---

## Step 4 — Verificación (OBLIGATORIA)

```bash
sqlite3 biblioteca-v1/modern-app/apps/backend/db/database.db < biblioteca-v1/modern-app/apps/backend/db/schema.sql
sqlite3 biblioteca-v1/modern-app/apps/backend/db/database.db ".schema"
```

Si hay errores de sintaxis, corrígelos y repite.
