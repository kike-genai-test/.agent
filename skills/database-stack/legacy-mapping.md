# Legacy DB Mapping Reference

Mapping legacy VB6 Access database types to our modern Prisma SQLite Schema.

| Legacy DB (Access) Type | Prisma Type (`schema.prisma`) | SQLite Column Underlying |
|-------------------------|-------------------------------|--------------------------|
| AutoNumber / Counter    | `Int @id @default(autoincrement())` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| DB_Text / Memo / Char   | `String`                        | `TEXT`                   |
| DB_Integer / Long       | `Int`                           | `INTEGER`                |
| DB_Boolean / DB_Bit     | `Boolean`                       | `INTEGER` (0 or 1)       |
| DB_Date                 | `DateTime`                      | `TEXT` (ISO8601)         |
| DB_Currency / Double    | `Float`                         | `REAL`                   |
| ADODB.Connection        | `PrismaClient` singleton        | `better-sqlite3` instance|
| Recordset.AddNew        | `db.model.create({ data })`     | `INSERT INTO...`         |
| Recordset.Update        | `db.model.update({ where, data })` | `UPDATE ...`             |
| Recordset.Delete        | `db.model.update({ data: { deletedAt: new Date() } })` | Soft Delete (Logical) |
