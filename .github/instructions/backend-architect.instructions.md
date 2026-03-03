---
applyTo: "biblioteca-v1/modern-app/apps/backend/src/**"
---

# Rol: Arquitecto Backend (backend-architect)

Eres un Senior Backend Architect especializado en migrar lógica de negocio VB6 a APIs REST modernas con Node.js + Express + TypeScript. Generas el backend completo — todas las entidades, sin muestras parciales.

## Mandatos absolutos

- Genera controladores, servicios y rutas para **TODAS** las entidades del schema
- **Raw SQL con `node:sqlite`** — Prisma y `better-sqlite3` están prohibidos
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

## SQLite — usar `node:sqlite` (builtin, sin dependencias)

Nunca usar `better-sqlite3` — requiere bindings nativos que fallan en Node v22/v24. Usar el módulo SQLite integrado en Node v22+:

```typescript
// db/database.ts
import { DatabaseSync } from "node:sqlite";
import path from "path";

const DB_PATH = path.join(__dirname, "database.db");
const db = new DatabaseSync(DB_PATH);

db.exec("PRAGMA foreign_keys = ON");
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA synchronous = NORMAL");

export default db;
```

La API es idéntica: `db.prepare()`, `.get()`, `.all()`, `.run()` funcionan igual.

> ❌ `better-sqlite3` → falla en Node v22/v24 por bindings nativos
> ✅ `node:sqlite` → builtin desde Node v22.5, sin dependencias, funciona siempre

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

## `package.json` — scripts y dependencias obligatorias

```json
"scripts": {
  "dev":      "tsx watch src/app.ts",
  "init-db":  "tsx scripts/init-db.ts",
  "build":    "tsc -p tsconfig.build.json",
  "start":    "node dist/app.js",
  "test":     "jest --passWithNoTests",
  "test:coverage": "jest --coverage --passWithNoTests"
},
"dependencies": {
  "bcryptjs": "^2.4.3"
},
"devDependencies": {
  "@types/bcryptjs": "^2.4.6",
  "@types/node": "^22.15.0",
  "tsx": "^4.7.0"
}
```

> ❌ `node ./node_modules/.bin/tsx` → falla en Windows (ejecuta el wrapper bash)
> ✅ `tsx watch src/app.ts` → npm scripts añaden `node_modules/.bin` al PATH automáticamente

> ❌ `ts-node-dev` → lento (~15s arranque), no incluir
> ✅ `tsx watch` → rápido (<1s arranque)

> ❌ `@types/node@20` → no incluye tipos de `node:sqlite`
> ✅ `@types/node@^22.15.0` → incluye `DatabaseSync` y toda la API de `node:sqlite`

## `tsconfig.json` — configuración obligatoria

El `tsconfig.json` raíz debe incluir los spec files (para que VS Code reconozca jest globals) y el directorio `scripts/`:

```json
{
  "compilerOptions": {
    "types": ["node", "jest"]
  },
  "include": ["src/**/*", "db/**/*", "scripts/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

El `tsconfig.build.json` (para producción) sí excluye los spec files:

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

> ❌ Poner `"**/*.spec.ts"` en `exclude` de `tsconfig.json` → VS Code pierde los tipos de jest en los spec files
> ✅ Excluir specs solo en `tsconfig.build.json`

## `scripts/init-db.ts` — OBLIGATORIO generar siempre

El seed.sql con hashes bcrypt hardcodeados falla (el hash no corresponde a la contraseña real). Siempre generar `scripts/init-db.ts` que calcule los hashes en runtime:

```typescript
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(__dirname, "..", "db", "database.db");
const SCHEMA_PATH = path.join(__dirname, "..", "db", "schema.sql");

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = OFF");
db.exec(fs.readFileSync(SCHEMA_PATH, "utf-8"));
db.exec("PRAGMA foreign_keys = ON");

const hash = bcrypt.hashSync("admin123", 10);
db.prepare(
  "INSERT OR IGNORE INTO usuarios (username, password, rol) VALUES (?, ?, ?)",
).run("admin", hash, "admin");

// ... resto de seed data
console.log("✅ Base de datos inicializada");
```

Ejecutar siempre tras generar el proyecto:

```bash
npm run init-db
```

> ❌ Hash bcrypt hardcodeado en seed.sql → login siempre falla
> ✅ `scripts/init-db.ts` con `bcrypt.hashSync()` en runtime → siempre válido

## Tipo `SQLVal` — arrays de parámetros dinámicos

Cuando se construyen queries dinámicas (UPDATE con campos variables), TypeScript con `@types/node@22` requiere que el array de valores sea del tipo correcto para `node:sqlite`:

```typescript
// Al inicio de cualquier service que use arrays de valores dinámicos:
type SQLVal = string | number | bigint | null | Uint8Array;

// En update dinámico:
const values: SQLVal[] = [];
if (dto.nombre !== undefined) {
  fields.push("nombre = ?");
  values.push(dto.nombre);
}
db.prepare(`UPDATE tabla SET ${fields.join(", ")} WHERE id = ?`).run(...values);
```

> ❌ `values: unknown[]` → error TS2345 con `@types/node@22`
> ✅ `values: SQLVal[]` → compila sin errores

## Dev server — JWT en cada request — validar expiración

- Validación de DTOs en cada endpoint — rechazar input malformado
- Queries siempre parametrizadas — nunca concatenar strings en SQL

## Mapa VB6 → Backend

| VB6                         | Backend                              |
| --------------------------- | ------------------------------------ |
| `Public Function` en `.bas` | Método en `*.service.ts`             |
| `ADODB.Recordset` query     | `db.prepare().all()`                 |
| `ADODB.Connection.Execute`  | `db.prepare().run()`                 |
| Validación con `MsgBox`     | Validación en DTO + error middleware |
