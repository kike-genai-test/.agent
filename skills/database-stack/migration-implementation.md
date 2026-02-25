# Database Migrations

> Erasing `CREATE TABLE IF NOT EXISTS` at runtime in favor of versioned schema changes.

## Why Versioned Migrations?

Doing `db.exec(schema)` on startup is dangerous in production. It doesn't handle column renaming, data backfilling, or dropping obsolete columns safely.

Our design mandates a **Safe Migration Strategy for zero-downtime changes**. Prisma Migrate tracks our changes in the `prisma/migrations` folder as pure SQL files.

## Workflow

1. **Modify the Schema:** Open `prisma/schema.prisma` and make your changes (e.g., add a column).
2. **Generate the Migration:** Run the migrate dev command.
   
```bash
npx prisma migrate dev --name add_profile_picture
```

This will:
- Check the difference between the current Prisma schema and the database schema.
- Generate an SQL file in `prisma/migrations/YYYYMMDDHHMMSS_add_profile_picture/migration.sql`.
- Apply it to your local SQLite development database.
- Prompt for data loss warnings before doing destructive changes.

## Production Deployments

In production, you do not run `migrate dev`. You run `migrate deploy` as part of your CI/CD pipeline or start script.

```bash
# Apply pending migrations to the production DB
npx prisma migrate deploy
```

## Advanced: Zero-Downtime Complex Changes

If you need to rename a column according to the `migrations.md` strategy (Add new -> migrate data -> deploy -> drop old):

1. **Step 1:** Add the new column in `schema.prisma`.
2. Run `npx prisma migrate dev --name prepare_column_rename --create-only`. This creates the SQL file but *doesn't apply it*.
3. Edit the generated `migration.sql` to include a manual `UPDATE` statement that copies the data from the old column to the new column.
4. Run `npx prisma migrate dev` to apply it.
5. Deploy to production.
6. **Step 2:** Remove the old column in `schema.prisma`.
7. Generate and deploy the next migration.
