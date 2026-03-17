---
name: database-stack
description: Complete specifications and patterns for the target SQLite database stack using raw SQL via node:sqlite.
allowed-tools: view_file, write_to_file, run_command
---

# Database Stack Manual v6.0 (SQLite + Raw SQL via node:sqlite)

## 📦 Version Requirements

| Technology | Version | Package |
|------------|---------|---------|
| **SQLite** | 3       | `node:sqlite` (builtin Node v22+) |
| **ORM**    | None    | Raw SQL with parameterized queries — **NO Prisma, NO `better-sqlite3`** |

## 🤔 Why SQLite for this Stack?

As per our `database-design` principles, we don't default to PostgreSQL without reason. SQLite was chosen for this backend because:
- **Zero-config deployments:** No separate database server required, simplifying edge and containerized deployments.
- **Performance:** For read-heavy applications or low-to-medium write concurrency, SQLite provides sub-millisecond local latency.
- **Portability:** The entire database is a single file, making backups and migrations across environments trivial.

## 🎯 Selective Reading Rule

**Read ONLY files relevant to the request!** 

| File | Description | When to Read |
|------|-------------|--------------|
| `schema-implementation.md` | Prisma schema setup, timestamps, soft deletes | Designing models |
| `orm-implementation.md` | Database connection and client usage | Writing queries |
| `migration-implementation.md` | Prisma migrate workflows | Schema changes |
| `optimization-implementation.md` | Avoiding N+1 queries with Prisma | Performance tuning |
| `legacy-mapping.md` | VB6 to SQLite/Prisma type mapping | Legacy migrations |
