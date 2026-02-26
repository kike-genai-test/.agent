# Schema Implementation (Prisma)

> Translating `database-design` principles into real Prisma schemas.

## Applying Principles

1. **Normalization:** Structured according to strict normal forms.
2. **Primary Keys:** Using `Int @id @default(autoincrement())` for simplicity or `String @id @default(uuid())` for distributed systems.
3. **Timestamps:** Every table MUST have `createdAt` and `updatedAt`.
4. **Soft Deletes:** Critical business models MUST have `deletedAt` for soft-deletion algorithms.

## Example Schema Definition

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Member {
  id        Int       @id @default(autoincrement())
  name      String
  address   String?
  phone     String?
  email     String?   @unique
  
  // Design Requirements
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // For soft-deletes

  loans     Loan[]
}

model Book {
  id        Int       @id @default(autoincrement())
  title     String
  author    String
  isbn      String?   @unique

  // Design Requirements
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // For soft-deletes

  loans     Loan[]
}

model Loan {
  id        Int       @id @default(autoincrement())
  startDate DateTime  @default(now())
  endDate   DateTime?
  returned  Boolean   @default(false)

  // Relationships (Foreign Keys)
  memberId  Int
  member    Member    @relation(fields: [memberId], references: [id], onDelete: Restrict)
  
  bookId    Int
  book      Book      @relation(fields: [bookId], references: [id], onDelete: Restrict)

  // Design Requirements
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  // Indexing for relationship traversal
  @@index([memberId])
  @@index([bookId])
}
```

## Foreign Key Rules (onDelete)

In SQLite/Prisma, relationships implement the rule: `Don't allow deletion of a Member if they have active loans`. We use `Restrict` or `NoAction` to enforce data integrity instead of `Cascade` deleting business records unless explicitly necessary.
