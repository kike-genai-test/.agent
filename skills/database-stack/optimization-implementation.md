# Optimizations & N+1 Queries

> Translating design optimization into stack realities.

## Understanding the N+1 Problem

An N+1 query happens when you query a list of entities, and then for each entity, you run another query to get its relationships.

**The Bad Way (N+1 queries = slow):**
```typescript
// 1 Query to get all members
const members = await db.member.findMany();

for (const member of members) {
  // N Queries (one for each member)
  const loans = await db.loan.findMany({ where: { memberId: member.id } });
  member.loans = loans;
}
```

## The Prisma Solution (JOINs / Includes)

To fulfill the design principle of avoiding N+1 and optimizing database roundtrips, Prisma handles relationship fetching natively via `include`.

**The Good Way (1 Query = fast):**
```typescript
// The generated SQL will effectively use JOINs or a single optimized batch query
const membersWithLoans = await db.member.findMany({
  include: {
    loans: {
      include: {
        book: true, // Fetch the nested book details too!
      }
    }
  }
});
```

## Logging Slow Queries

From `optimization.md`, we know `EXPLAIN ANALYZE` is crucial. In Prisma, we capture slow queries by subscribing to events if a query runs too long.

```typescript
import { PrismaClient } from '@prisma/client'

export const db = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
})

db.$on('query', (e) => {
  if (e.duration > 100) { // Threshold in milliseconds
    console.warn(`[SLOW QUERY] ${e.duration}ms: ${e.query}`)
  }
})
```
