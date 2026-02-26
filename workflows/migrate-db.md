---
description: Exports Access data and imports it into SQLite via Prisma. FULLY AUTOMATED - ALL TABLES.
---

// turbo-all

# Migrate Database Workflow v3.0 (Fully Automated)

## Execution Mode

| Setting | Value |
|---------|-------|
| **Confirmation Required** | ❌ NO |
| **Migration Scope** | 🔄 ALL TABLES |
| **Auto-Continue** | ✅ YES |

---

## Step 1: Export ALL Tables from Access

```bash
mkdir -p exports

# Auto-discover the Access Database file in the project folder
ACCESS_DB=$(find "${VB6_DIR}" -type f \( -iname "*.mdb" -o -iname "*.accdb" \) | head -n 1)

if [ -z "$ACCESS_DB" ]; then
  echo "❌ ERROR: No .mdb or .accdb file found in $VB6_DIR"
  exit 1
fi

echo "🔍 Found legacy database: $ACCESS_DB"

# Export ALL tables (iterate from schema analysis)
# Wait for the DB Agent to extract the tables from the schema.json and loop over them
# Example iteration pseudo-code:
# for table in $(cat tables.txt); do mdb-export "$ACCESS_DB" "$table" > exports/"$table".csv; done
```

---

## Step 2: Generate Complete Prisma Schema

Generate `prisma/schema.prisma` with:
- ALL models from the generic database analysis document (`[PROJECT_NAME]_DATABASE.md` or similar)
- ALL relationships (foreign keys)
- Proper type mappings
- **CRITICAL:** Comply strictly with all regulations of `database-stack` (e.g. timestamps, soft deletes, index relations). Do not generate a schema without applying these strict organizational DB policies.

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ALL models generated here - not just samples
// MUST strictly adhere to database-stack rules
```

---

## Step 3: Run Migrations (Auto)

```bash
npx prisma format

# STRICT QUALITY GATE: Validate schema against database-stack rules
python .agent/skills/database-stack/scripts/schema_validator.py .

npx prisma validate
npx prisma migrate dev --name init
npx prisma generate
```

---

## Step 4: Seed ALL Data

Generate and run seed script for ALL tables:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function seedTable(tableName: string, csvPath: string) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].split(',');
    const data: Record<string, any> = {};
    headers.forEach((h, idx) => {
      data[h] = values[idx]?.trim();
    });
    await (prisma as any)[tableName].create({ data });
  }
  console.log(`✅ Seeded ${tableName}`);
}

async function main() {
  // Seed ALL tables in dependency order
  const tables = [
    // Parent tables first
    // Child tables after
  ];
  
  for (const table of tables) {
    await seedTable(table, `./exports/${table.toLowerCase()}.csv`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

```bash
npx ts-node prisma/seed.ts
```

---

## Step 5: Verify (Auto)

```bash
# Open Prisma Studio to verify
npx prisma studio &

# Verify counts
npx prisma db execute --stdin <<< "SELECT name, (SELECT COUNT(*) FROM name) as count FROM sqlite_master WHERE type='table';"
```

---

## Auto-Continue

After database migration completes, automatically proceed to UI migration.

**No confirmation required.**
