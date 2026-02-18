---
name: db-transform
description: Techniques for migrating Access Databases to SQLite.
allowed-tools: run_command, mcp_db-usuarios_query
---

# Database Transformation Guide

## Access Data Types Map
| Access (.mdb) | SQLite | Notes |
| Link | TEXT | |
| Byte | INTEGER | |
| Integer | INTEGER | |
| Long | INTEGER | |
| Currency | REAL | |
| Single, Double | REAL | |
| Date/Time | TEXT | ISO8601 format: YYYY-MM-DD HH:MM:SS |
| Text (255) | TEXT | |
| Memo | TEXT | |
| Yes/No | INTEGER | 0=False, -1=True (Convert -1 to 1) |
| OLE Object | BLOB | Consider storing files on disk instead |

## Migration Steps
1.  **Export**: Use `mdb-export` (tools like MDB Tools) to get CSVs.
2.  **Clean**: Remove Windows-1252 artifacts.
3.  **Import**: Use SQLite `.import` command or Node.js script to INSERT data.

## SQLite Schema Patterns
*   **Naming**: Use `snake_case` for table and column names.
*   **Primary Keys**: Use `INTEGER PRIMARY KEY AUTOINCREMENT` for auto-incrementing IDs.
*   **Foreign Keys**: Enable with `PRAGMA foreign_keys = ON` and use `FOREIGN KEY` constraints.
    ```sql
    CREATE TABLE users (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       created_at TEXT DEFAULT (datetime('now'))
    );
    
    CREATE TABLE orders (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       user_id INTEGER NOT NULL,
       FOREIGN KEY (user_id) REFERENCES users(id)
    );
    ```

