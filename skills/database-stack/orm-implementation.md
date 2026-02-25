# ORM Implementation

> Moving away from raw SQL strings for safety and better DX.

## The Problem with Raw SQL

Previously the stack used raw SQL statements like:
`db.prepare('INSERT INTO members (name) VALUES (?)').run(name)`

This violates safety principles because:
- No compile-time type checking.
- Vulnerable to typos and changes in schema.
- Hard to refactor.

## The Prisma Solution

We instantiate a global singleton for Prisma to prevent exhausting connection limits, especially in development environments (like Next.js/Vite with HMR).

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

// Ensure a single connection instance
export const db = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = db
```

## Making Queries (TypeScript)

Types are automatically generated from `schema.prisma`.

```typescript
// Fetching data
const member = await db.member.findUnique({
  where: { id: 1 },
});

// Inserting data
const newBook = await db.book.create({
  data: {
    title: "1984",
    author: "George Orwell",
  },
});
```

## Enforcing Soft-Deletes

Since we added `deletedAt` to our schema, our queries should respect it by default. We can use Prisma extensions to enforce this globally:

```typescript
// Example of extending Prisma to filter soft-deleted records:
export const db = prismaClientSingleton().$extends({
  query: {
    $allModels: {
      async findMany({ model, operation, args, query }) {
        if ('deletedAt' in args.where === false) {
          args.where = { ...args.where, deletedAt: null }
        }
        return query(args)
      },
    },
  },
})
```
