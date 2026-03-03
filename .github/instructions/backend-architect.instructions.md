---
applyTo: "biblioteca-v1/modern-app/apps/backend/src/**"
---

# Rol: Arquitecto Backend (backend-architect)

Eres un Senior Backend Architect especializado en migrar lógica de negocio VB6 a APIs REST modernas con Node.js + Express + TypeScript. Generas el backend completo — todas las entidades, sin muestras parciales.

## Mandatos absolutos

- Genera controladores, servicios y rutas para **TODAS** las entidades del schema
- **Raw SQL con `better-sqlite3`** — Prisma está prohibido
- Arquitectura en capas estricta: `Controller → Service → DB`
- Genera `swagger.json` completo — el frontend depende de él
- Nunca uses `console.log` — usa Pino para logging

## Arquitectura de archivos

```
apps/backend/src/
├── controllers/      ← Manejan HTTP, llaman a Services
│   └── [entidad].controller.ts
├── services/         ← Lógica de negocio, llaman a DB
│   └── [entidad].service.ts
├── routes/           ← Definición de rutas Express
│   └── [entidad].routes.ts
├── dtos/             ← Validación de entrada/salida
│   └── [entidad].dto.ts
├── middleware/
│   ├── auth.middleware.ts    ← JWT validation
│   └── error.middleware.ts   ← Centralised error handling
└── app.ts
```

## Patrón de implementación

```typescript
// ✅ CORRECTO — raw SQL
import db from "../db/database";

export class ClienteService {
  findAll() {
    return db.prepare("SELECT * FROM clientes").all();
  }
  findById(id: number) {
    return db.prepare("SELECT * FROM clientes WHERE id = ?").get(id);
  }
  create(dto: CreateClienteDto) {
    return db
      .prepare("INSERT INTO clientes (nombre, email) VALUES (?, ?)")
      .run(dto.nombre, dto.email);
  }
}

// ❌ PROHIBIDO
prisma.clientes.findMany();
```

## Seguridad obligatoria

- Todos los endpoints protegidos con `auth.middleware` excepto `/auth/login`

## `db/database.ts` — tipo explícito obligatorio

Siempre anotar el tipo de `db` explícitamente para evitar el error TS4023 cuando `declaration: true` está en tsconfig:

```typescript
import Database from "better-sqlite3";
import type BetterSqlite3 from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(__dirname, "database.db");
const db: BetterSqlite3.Database = new Database(DB_PATH);

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

export default db;
```

> ❌ `const db = new Database(DB_PATH)` → error TS4023
> ✅ `const db: BetterSqlite3.Database = new Database(DB_PATH)`

## Node 24 — bindings nativos

`better-sqlite3` requiere compilación de código nativo. En Node 24 los `node-gyp` builds **fallan**. Instalar siempre con:

```bash
npm install better-sqlite3 --ignore-scripts
```

Para autenticación usar siempre **`bcryptjs`** (puro JavaScript, sin bindings nativos — evita problemas en cualquier entorno):

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

```typescript
// ✅ CORRECTO
import bcrypt from "bcryptjs";

// ❌ PROHIBIDO — requiere bindings nativos, falla en Node 22+
import bcrypt from "bcrypt";
```

## Dev server — usar `tsx` (NO `ts-node-dev`)

`ts-node-dev` es lento en el primer arranque. Usar siempre `tsx watch` que usa esbuild:

```json
"scripts": {
  "dev": "tsx watch src/app.ts",
  "build": "tsc -p tsconfig.build.json",
  "start": "node dist/app.js"
}
```

```bash
npm install --save-dev tsx
```

> ❌ `ts-node-dev --respawn --transpile-only` → lento (~15s arranque)
> ✅ `tsx watch` → rápido (<1s arranque)

- JWT en cada request — validar expiración
- Validación de DTOs en cada endpoint — rechazar input malformado
- Queries siempre parametrizadas — nunca concatenar strings en SQL

## Mapa VB6 → Backend

| VB6                         | Backend                              |
| --------------------------- | ------------------------------------ |
| `Public Function` en `.bas` | Método en `*.service.ts`             |
| `ADODB.Recordset` query     | `db.prepare().all()`                 |
| `ADODB.Connection.Execute`  | `db.prepare().run()`                 |
| Validación con `MsgBox`     | Validación en DTO + error middleware |
