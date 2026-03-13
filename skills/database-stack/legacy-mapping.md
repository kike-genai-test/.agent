# Legacy DB Mapping Reference

Mapping legacy VB6 Access database types to our modern SQLite schema with raw SQL via `node:sqlite`.

| Legacy DB (Access) Type | SQLite Column Type | TypeScript Type | Raw SQL Example |
|-------------------------|--------------------|-----------------|-----------------|
| AutoNumber / Counter    | `INTEGER PRIMARY KEY AUTOINCREMENT` | `number` | `id INTEGER PRIMARY KEY AUTOINCREMENT` |
| DB_Text / Memo / Char   | `TEXT`             | `string`        | `nombre TEXT NOT NULL` |
| DB_Integer / Long       | `INTEGER`          | `number`        | `cantidad INTEGER DEFAULT 0` |
| DB_Boolean / DB_Bit     | `INTEGER` (0 or 1) | `boolean`      | `activo INTEGER DEFAULT 1` |
| DB_Date                 | `TEXT` (ISO8601)   | `Date`          | `created_at TEXT DEFAULT (datetime('now'))` |
| DB_Currency / Double    | `REAL`             | `number`        | `precio REAL NOT NULL` |
| Null                    | `NULL`             | `| null`        | `deleted_at TEXT` (nullable) |

### Legacy VB6 Operations → Raw SQL

| VB6 / ADODB Operation   | Raw SQL (`node:sqlite`)                | TypeScript |
|--------------------------|----------------------------------------|------------|
| `ADODB.Connection`       | `new DatabaseSync(path)` singleton     | `import { DatabaseSync } from "node:sqlite"` |
| `Recordset.AddNew`       | `INSERT INTO table (...) VALUES (?)` | `db.prepare("INSERT...").run(...)` |
| `Recordset.Update`       | `UPDATE table SET ... WHERE id = ?`  | `db.prepare("UPDATE...").run(...)` |
| `Recordset.Delete`       | `UPDATE table SET activo = 0 WHERE id = ?` | Soft Delete (Logical) |
| `Recordset.MoveNext` loop | `SELECT * FROM table`               | `db.prepare("SELECT...").all()` |
| `Recordset.RecordCount`  | `SELECT COUNT(*) FROM table`         | `db.prepare("SELECT COUNT(*)...").get()` |
