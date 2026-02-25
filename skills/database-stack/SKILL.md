---
name: database-stack
description: Complete specifications and patterns for the target SQLite database stack (better-sqlite3) used by the backend.
allowed-tools: view_file, write_to_file, run_command
---

# Database Stack Manual v4.0 (SQLite 3)

## 📦 Version Requirements

| Technology | Version | Package |
|------------|---------|---------|
| **SQLite** | 3 | `better-sqlite3` |

# 1. 💾 Database Specifications

## 1.1 SQLite Schema Structure

```sql
-- db/schema.sql
-- SQLite Database Schema Example

CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  start_date TEXT DEFAULT (datetime('now')),
  end_date TEXT,
  returned INTEGER DEFAULT 0,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE INDEX IF NOT EXISTS idx_loans_member ON loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_book ON loans(book_id);
```

## 1.2 Database Connection

```typescript
// db/database.ts
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '../../database.db');

// Initialize database
export const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
});

// Enable foreign keys constraints
db.pragma('foreign_keys = ON');

// Initialize schema if not exists
export function initializeDatabase() {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
  console.log('✅ Database initialized');
}

// Graceful shutdown
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));
```

## 1.3 VB6 / Legacy Database Mapping Reference

| Legacy DB Type | SQLite Column Type | Notes |
|----------------|--------------------|-------|
| AutoNumber / Counter | `INTEGER PRIMARY KEY AUTOINCREMENT` | Primary Keys |
| DB_Text / Memo / Char | `TEXT` | Any string data |
| DB_Integer / Long | `INTEGER` | Numeric values |
| DB_Boolean / DB_Bit | `INTEGER` | 0 or 1 with constraints |
| DB_Date | `TEXT` | Saved as ISO8601 strings e.g. 'YYYY-MM-DD' |
| DB_Currency / Double / Decimal | `REAL` | Approximate Decimals/Floats |
| ADODB.Connection | `better-sqlite3` connection | Via db.ts |
| Recordset.AddNew | `db.prepare('INSERT...').run()` | |
