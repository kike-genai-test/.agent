---
name: backend-stack
description: Complete specifications and patterns for the target Node.js API stack (Express 5+, Pino, Swagger, raw SQL).
allowed-tools: view_file, write_to_file, run_command
---

# Backend Stack Manual v4.0 (Express 5 + raw SQL)

## 📦 Version Requirements

| Technology | Version | Package |
|------------|---------|---------|
| **Node.js** | 24+ | runtime |
| **Express** | 5+ | `express` |
| **Pino** | Latest | `pino`, `pino-http` |
| **Swagger** | Latest | `swagger-ui-express`, `swagger-jsdoc` |

# 1. 🛠️ Backend Specifications

## 1.1 Project Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── schema.sql        # SQLite schema
│   │   ├── database.ts       # Database connection
│   │   └── migrations/       # SQL migration files
│   ├── routes/
│   │   ├── index.ts          # Route aggregator
│   │   ├── members.routes.ts
│   │   └── books.routes.ts
│   ├── controllers/
│   │   ├── members.controller.ts
│   │   └── books.controller.ts
│   ├── services/
│   │   ├── members.service.ts
│   │   └── books.service.ts
│   ├── types/
│   │   ├── index.ts
│   │   └── members.dto.ts
│   ├── middlewares/
│   │   ├── error.middleware.ts
│   │   └── logging.middleware.ts
│   └── server.ts
├── database.db               # SQLite database file
├── package.json
└── tsconfig.json
```

## 1.2 Express Server with Pino

```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { routes } from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
}));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', routes);

// Error handling (must be last)
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
});
```

## 1.3 Service Layer Pattern

```typescript
// src/services/members.service.ts
import { db } from '../db/database';
import { CreateMemberDto, UpdateMemberDto } from '../types';

export interface Member {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export class MembersService {
  findAll(): Member[] {
    const stmt = db.prepare('SELECT * FROM members ORDER BY name ASC');
    return stmt.all() as Member[];
  }

  findOne(id: number): Member | undefined {
    const stmt = db.prepare('SELECT * FROM members WHERE id = ?');
    return stmt.get(id) as Member | undefined;
  }

  findOneWithLoans(id: number) {
    const member = this.findOne(id);
    if (!member) return null;
    
    const loansStmt = db.prepare('SELECT * FROM loans WHERE member_id = ?');
    const loans = loansStmt.all(id);
    
    return { ...member, loans };
  }

  create(data: CreateMemberDto): Member {
    const stmt = db.prepare(`
      INSERT INTO members (name, address, phone, email)
      VALUES (@name, @address, @phone, @email)
    `);
    
    const result = stmt.run(data);
    return this.findOne(result.lastInsertRowid as number)!;
  }

  update(id: number, data: UpdateMemberDto): Member {
    const stmt = db.prepare(`
      UPDATE members 
      SET name = COALESCE(@name, name),
          address = COALESCE(@address, address),
          phone = COALESCE(@phone, phone),
          email = COALESCE(@email, email)
      WHERE id = @id
    `);
    
    stmt.run({ ...data, id });
    return this.findOne(id)!;
  }

  delete(id: number): void {
    const stmt = db.prepare('DELETE FROM members WHERE id = ?');
    stmt.run(id);
  }
}

export const membersService = new MembersService();
```

## 1.4 Controller Layer Pattern

```typescript
// src/controllers/members.controller.ts
import { Request, Response, NextFunction } from 'express';
import { membersService } from '../services/members.service';

export class MembersController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await membersService.findAll();
      res.json(members);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const member = await membersService.findOne(id);
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      res.json(member);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await membersService.create(req.body);
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const member = await membersService.update(id, req.body);
      res.json(member);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await membersService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const membersController = new MembersController();
```

## 1.5 Routes with Swagger

```typescript
// src/routes/members.routes.ts
import { Router } from 'express';
import { membersController } from '../controllers/members.controller';

const router = Router();

/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
 *     responses:
 *       200:
 *         description: List of members
 *   post:
 *     summary: Create new member
 *     tags: [Members]
 */
router.get('/', membersController.getAll);
router.post('/', membersController.create);

/**
 * @swagger
 * /api/members/{id}:
 *   get:
 *     summary: Get member by ID
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *   put:
 *     summary: Update member
 *     tags: [Members]
 *   delete:
 *     summary: Delete member
 *     tags: [Members]
 */
router.get('/:id', membersController.getById);
router.put('/:id', membersController.update);
router.delete('/:id', membersController.delete);

export const membersRoutes = router;
```

## 1.6 Error Middleware

```typescript
// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { SqliteError } from 'better-sqlite3';

export function errorMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.log.error(error);

  // SQLite errors
  if (error instanceof SqliteError) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'A record with this data already exists' });
    }
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({ message: 'Invalid reference to related record' });
    }
    if (error.code === 'SQLITE_NOTFOUND') {
      return res.status(404).json({ message: 'Record not found' });
    }
  }

  // Default error
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

## 1.7 Swagger Configuration

```typescript
// src/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Reference',
      version: '1.0.0',
      description: 'REST API Documentation'
    },
    servers: [
      { url: 'http://localhost:3000' }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
```
