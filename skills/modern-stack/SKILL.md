---
name: modern-stack
description: Complete specifications and patterns for the target stack (Angular 21, Node 24+, Express 5+, SQLite with raw SQL).
allowed-tools: view_file, write_to_file, run_command
---

# Modern Stack Manual v4.0 (Zoneless + Raw SQLite)

## 📦 Version Requirements

| Technology | Version | Package |
|------------|---------|---------|
| **Angular** | 21+ | `@angular/core` |
| **Angular Material** | 21+ | `@angular/material` |
| **Node.js** | 24+ | runtime |
| **Express** | 5+ | `express` |
| **SQLite** | 3 | `better-sqlite3` |
| **Material Icons** | Latest | `Material Symbols / Icons` |
| **Pino** | Latest | `pino`, `pino-http` |
| **Swagger** | Latest | `swagger-ui-express`, `swagger-jsdoc` |

> [!IMPORTANT]
> **ZONELESS ANGULAR**: This stack uses `provideExperimentalZonelessChangeDetection()` - NO Zone.js required!



# 1. ⚙️ Frontend Specifications

## 1.1 Angular Core Patterns

### Standalone Components (Required - Strict Mode)
```typescript
@Component({
  selector: 'app-members',
  standalone: true,  // ⚠️ MANDATORY - NEVER use NgModules
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush  // ⚠️ REQUIRED for Zoneless
})
export class MembersComponent {
  // Use Signals for ALL state - Required for Zoneless
  data = signal<Member[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
}
```

### main.ts Bootstrap (ZONELESS - No Zone.js!)
```typescript
// main.ts - ZONELESS Angular 21
// ⚠️ DO NOT import zone.js - We use Zoneless Change Detection!
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

### app.config.ts (ZONELESS Configuration)
```typescript
// app.config.ts - CRITICAL: Zoneless Setup
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ⚠️ CRITICAL: Enable Zoneless Change Detection
    provideExperimentalZonelessChangeDetection(),
    
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideAnimationsAsync()
  ]
};
```

> [!CAUTION]
> **ZONELESS REQUIREMENTS:**
> 1. ALL components MUST use `changeDetection: ChangeDetectionStrategy.OnPush`
> 2. ALL state MUST be managed with Signals (never plain variables)
> 3. NEVER use `setTimeout` or `setInterval` for UI updates - use `effect()` instead
> 4. NEVER import `zone.js` anywhere in the application

### Signals for State Management (MANDATORY for Zoneless)

```typescript
// ✅ Correct: Use Signals
data = signal<Member[]>([]);
selectedItem = signal<Member | null>(null);
isLoading = signal(false);

// Computed signals
totalItems = computed(() => this.data().length);

// Effect for side effects
constructor() {
  effect(() => {
    console.log('Data changed:', this.data().length);
  });
}

// ❌ Avoid: BehaviorSubject for component state
```

> [!CAUTION]
> When using `ngModel` inside a `<form>` tag, you **MUST** add a `name` attribute to the input:
> ```html
> <!-- ✅ Correct -->
> <input name="email" [ngModel]="email()" (ngModelChange)="email.set($event)">
> 
> <!-- ❌ Error NG01352 -->
> <input [ngModel]="email()" (ngModelChange)="email.set($event)">
> ```

### VB6 Pattern: Entity Pre-Validation (cmdcons_Click)
VB6 often validates entity state before allowing operations. Migrate this pattern:

```typescript
// VB6: Check if socio has pending loans before new loan
// cmdcons_Click() -> "Este Socio Tiene X libros no devueltos"

clientPendingLoans = signal<Libro[]>([]);
showPendingWarning = signal(false);

async onClientSelected(clienteId: number) {
  this.selectedClienteId.set(clienteId);
  
  const pendingLoans = this.loanedBooks().filter(
    libro => libro.socioId === clienteId
  );
  
  this.clientPendingLoans.set(pendingLoans);
  this.showPendingWarning.set(pendingLoans.length > 0);
}
```

```html
<!-- Show warning like VB6 MsgBox -->
@if (showPendingWarning()) {
<div class="warning-box">
  <span>⚠️</span>
  <strong>Este socio tiene {{ clientPendingLoans().length }} libro(s) no devuelto(s)</strong>
</div>
}
```

### VB6 Pattern: DateAdd Calculation
```typescript
// VB6: DateAdd("d", Val(txtdias), Now())
returnDate = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + this.dias());
  return date;
});
```

## 1.2 Angular Material + UI

### MatDialog for Modals (VB6 Form Replacement)
```typescript
// Opening dialog
openDialog(item?: Member): void {
  const dialogRef = this.dialog.open(MemberDialogComponent, {
    width: '600px',
    data: item ?? null,
    disableClose: true
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadData();
    }
  });
}
```

### Modern Date Picker
```html
<mat-form-field appearance="outline">
  <mat-label>Loan Date</mat-label>
  <input matInput [matDatepicker]="picker" formControlName="loanDate">
  <mat-datepicker-toggle matIconSuffix [for]="picker">
    <mat-icon matDatepickerToggleIcon>today</mat-icon>
  </mat-datepicker-toggle>
  <mat-datepicker #picker></mat-datepicker>
  <mat-error *ngIf="form.get('loanDate')?.hasError('required')">
    Date is required
  </mat-error>
</mat-form-field>
```

### Material Icons (Required)

Use standard Angular Material Icons (Google Fonts).

```html
<!-- index.html -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<!-- In templates -->
<mat-icon>add</mat-icon>
<mat-icon>edit</mat-icon>
<mat-icon>delete</mat-icon>
<mat-icon>search</mat-icon>
<mat-icon>save</mat-icon>
```

## 1.3 Reactive Forms

### Form Structure
```typescript
export class MemberDialogComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100)
    ]),
    email: new FormControl('', [
      Validators.email
    ]),
    phone: new FormControl(''),
    registrationDate: new FormControl(new Date(), Validators.required)
  });

  // Custom validator example
  private validateNotFutureDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const date = control.value;
      if (date && date > new Date()) {
        return { futureDate: true };
      }
      return null;
    };
  }
}
```

### Form Template Pattern
```html
<form [formGroup]="form" (ngSubmit)="save()">
  <mat-form-field appearance="outline" class="full-width">
    <mat-label>Name</mat-label>
    <input matInput formControlName="name" placeholder="Full name">
    <mat-error *ngIf="form.get('name')?.hasError('required')">
      Name is required
    </mat-error>
    <mat-error *ngIf="form.get('name')?.hasError('minlength')">
      Minimum 2 characters
    </mat-error>
  </mat-form-field>
  
  <div mat-dialog-actions align="end">
    <button mat-button type="button" (click)="cancel()">
      <mat-icon>close</mat-icon>
      Cancel
    </button>
    <button mat-raised-button color="primary" type="submit" [disabled]="!form.valid">
      <mat-icon>save</mat-icon>
      Save
    </button>
  </div>
</form>
```

## 1.4 HTTP Client + Error Interceptor

### Service Pattern
```typescript
@Injectable({ providedIn: 'root' })
export class MembersService {
  private readonly apiUrl = '/api/members';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Member[]> {
    return this.http.get<Member[]>(this.apiUrl);
  }

  getById(id: number): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateMemberDto): Observable<Member> {
    return this.http.post<Member>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateMemberDto): Observable<Member> {
    return this.http.put<Member>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

### Error Interceptor (HttpInterceptorFn)

#### HTTP Error Codes Reference

| Code | Condition | Name | Description | Interceptor Action |
|------|-----------|------|-------------|-------------------|
| `0` | `!navigator.onLine` | Offline / No Network | No internet connection | 📡 "No internet connection. Check your network." |
| `0` | `navigator.onLine` | Unknown / CORS / Down | Server down or CORS | ⚠️ "Could not contact the server." |
| `400` | N/A | Bad Request | Invalid syntax or malformed JSON | Show `error.message` from backend |
| `401` | N/A | Unauthorized | Expired or missing token | 🔒 Refresh Token or redirect to Login |
| `403` | N/A | Forbidden | No permissions for this resource | ⛔ "You don't have permission for this action." |
| `404` | N/A | Not Found | Resource doesn't exist | Redirect to 404 or show message |
| `405` | N/A | Method Not Allowed | Wrong HTTP method | Log to console (dev error) |
| `408` | N/A | Request Timeout | Client took too long | Suggest retry |
| `409` | N/A | Conflict | Duplicate record | Show specific error in form |
| `422` | N/A | Unprocessable Entity | Validation error | Map errors to form fields |
| `429` | N/A | Too Many Requests | Rate limiting exceeded | ⏳ Block button temporarily |
| `500` | N/A | Internal Server Error | Backend bug | 🔥 "Internal server error. Try again later." |
| `501` | N/A | Not Implemented | Endpoint under construction | Log error |
| `502` | N/A | Bad Gateway | Invalid response from internal service | Ask to retry |
| `503` | N/A | Service Unavailable | Maintenance or overload | 🛠️ "Server under maintenance." |
| `504` | N/A | Gateway Timeout | Backend timeout | "The operation is taking longer than expected." |

#### Complete Error Interceptor Implementation

```typescript
// interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Unknown error';
      let duration = 5000;
      let shouldNavigate = false;
      let navigateTo = '';

      // Handle offline / network errors (status 0)
      if (error.status === 0) {
        if (!navigator.onLine) {
          message = '📡 No internet connection. Check your network.';
        } else {
          message = '⚠️ Could not contact the server.';
        }
      } else {
        switch (error.status) {
          case 400:
            message = error.error?.message || 'Invalid request.';
            break;
          case 401:
            message = '🔒 Session expired. Please log in again.';
            shouldNavigate = true;
            navigateTo = '/login';
            // TODO: Implement refresh token logic here
            break;
          case 403:
            message = '⛔ You don\'t have permission for this action.';
            break;
          case 404:
            message = 'The requested resource does not exist.';
            break;
          case 405:
            console.error('[DEV] Method Not Allowed:', req.method, req.url);
            message = 'Configuration error (405).';
            break;
          case 408:
            message = 'The request took too long. Please try again.';
            break;
          case 409:
            message = error.error?.message || 'Conflict: record already exists.';
            break;
          case 422:
            // Validation errors - don't show snackbar, let form handle it
            return throwError(() => error);
          case 429:
            message = '⏳ Too many requests. Please wait a moment.';
            duration = 10000;
            break;
          case 500:
            message = '🔥 Internal server error. Try again later.';
            break;
          case 501:
            console.warn('[DEV] Not Implemented:', req.url);
            message = 'Feature not available.';
            break;
          case 502:
            message = 'Connection error with internal services.';
            break;
          case 503:
            message = '🛠️ Server under maintenance. Try again in a few minutes.';
            break;
          case 504:
            message = 'The operation is taking longer than expected.';
            break;
          default:
            message = error.error?.message || `Error ${error.status}`;
        }
      }

      // Show snackbar notification
      snackBar.open(message, 'Close', {
        duration,
        panelClass: error.status >= 500 ? ['error-snackbar-critical'] : ['error-snackbar']
      });

      // Navigate if needed
      if (shouldNavigate) {
        router.navigate([navigateTo]);
      }

      return throwError(() => error);
    })
  );
};
```

#### App Configuration

```typescript
// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([errorInterceptor]))
  ]
};
```

#### Snackbar Styles

```scss
// styles.scss
.error-snackbar {
  --mdc-snackbar-container-color: #f44336;
  --mdc-snackbar-supporting-text-color: white;
}

.error-snackbar-critical {
  --mdc-snackbar-container-color: #b71c1c;
  --mdc-snackbar-supporting-text-color: white;
}
```


## 1.5 Navigation & Layout (CRITICAL for UX)

> [!IMPORTANT]
> **All VB6 migrations MUST include a proper navigation system.** VB6 apps use menus/MDI - modern apps need sidebar navigation.

### Layout Component Pattern (Required)
```typescript
// components/layout/layout.component.ts
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  private auth = inject(AuthService);
  
  navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/clientes', icon: 'people', label: 'Clientes' },
    { path: '/libros', icon: 'library_books', label: 'Libros' },
    { path: '/prestamos', icon: 'swap_horiz', label: 'Préstamos' },
  ];

  logout() {
    this.auth.logout();
    window.location.href = '/login';
  }
}
```

### Layout Template
```html
<div class="app-layout">
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="logo">📚</span>
      <h1>App Name</h1>
    </div>
    <nav class="sidebar-nav">
      @for (item of navItems; track item.path) {
        <a [routerLink]="item.path" routerLinkActive="active" class="nav-item">
          <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      }
    </nav>
    <div class="sidebar-footer">
      <button class="logout-btn" (click)="logout()">🚪 Cerrar Sesión</button>
    </div>
  </aside>
  <main class="main-content">
    <router-outlet />
  </main>
</div>
```

### Routes with Layout (Nested Children)
```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  // Protected routes wrapped in layout
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [() => authGuard()],
    children: [
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'clientes', loadComponent: () => import('./components/clientes/clientes-list.component').then(m => m.ClientesListComponent) },
      // ... more child routes
    ]
  },
  { path: '**', redirectTo: 'login' }
];
```

> [!TIP]
> **VB6 Menu → Sidebar Mapping:**
> - `mnuFile` → Dashboard/Home
> - `mnuClientes` → /clientes
> - `mnuLibros` → /libros
> - `mnuPrestamos` → /prestamos
> - `mnuSalir` → Logout button in sidebar footer

## 1.6 Internationalization (i18n)

```typescript
// Add to app.config.ts
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ]
};
```

## 1.6 Feature Module Structure

```
src/app/
├── components/
│   ├── members/
│   │   ├── members.component.ts       # List + Table
│   │   ├── members.component.html
│   │   └── members.component.scss
│   ├── member-dialog/
│   │   ├── member-dialog.component.ts # Create/Edit Modal
│   │   ├── member-dialog.component.html
│   │   └── member-dialog.component.scss
│   └── shared/
│       ├── confirm-dialog/           # Reusable confirm
│       └── loading-spinner/          # Reusable spinner
├── services/
│   ├── members.service.ts
│   └── auth.service.ts
├── models/
│   ├── member.model.ts
│   └── index.ts
├── interceptors/
│   └── error.interceptor.ts
└── guards/
    └── auth.guard.ts
```

---

# 2. 🛠️ Backend Specifications

## 2.1 Project Structure

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

## 2.2 SQLite Schema

```sql
-- db/schema.sql
-- SQLite Database Schema

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

## 2.3 Database Connection

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

// Enable foreign keys
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

## 2.4 Express Server with Pino

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

## 2.5 Service Layer Pattern

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

## 2.6 Controller Layer Pattern

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

## 2.7 Routes with Swagger

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
 */
router.get('/', membersController.getAll);

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
 *     responses:
 *       200:
 *         description: Member found
 *       404:
 *         description: Member not found
 */
router.get('/:id', membersController.getById);

/**
 * @swagger
 * /api/members:
 *   post:
 *     summary: Create new member
 *     tags: [Members]
 */
router.post('/', membersController.create);

/**
 * @swagger
 * /api/members/{id}:
 *   put:
 *     summary: Update member
 *     tags: [Members]
 */
router.put('/:id', membersController.update);

/**
 * @swagger
 * /api/members/{id}:
 *   delete:
 *     summary: Delete member
 *     tags: [Members]
 */
router.delete('/:id', membersController.delete);

export const membersRoutes = router;
```

## 2.8 Error Middleware

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
    // SQLITE_CONSTRAINT (unique, foreign key, etc.)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({
        message: 'A record with this data already exists'
      });
    }
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({
        message: 'Invalid reference to related record'
      });
    }
    if (error.code === 'SQLITE_NOTFOUND') {
      return res.status(404).json({
        message: 'Record not found'
      });
    }
  }

  // Default error
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

## 2.9 Swagger Configuration

```typescript
// src/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API',
      version: '1.0.0',
      description: 'REST API for library management'
    },
    servers: [
      { url: 'http://localhost:3000' }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
```

---

# 3. 📋 VB6 → Modern Mapping Reference

| VB6 Concept | Modern Equivalent | Migration Path |
|-------------|-------------------|----------------|
| `Form_Load` | `ngOnInit()` | Direct map |
| `cmdButton_Click` | `(click)="method()"` | Direct map |
| `txtField.Text` | `formControl.value` | Reactive forms |
| `MSFlexGrid` | `mat-table` | Angular Material |
| `DataCombo` | `mat-select` + async data | Angular Material |
| `MsgBox` | `MatSnackBar` | UI update |
| `InputBox` | `MatDialog` | Custom dialog |
| `Form.Show vbModal` | `MatDialog.open()` | Direct map |
| `ADODB.Connection` | better-sqlite3 | Raw SQL |
| `Recordset.AddNew` | `db.prepare('INSERT...')` | Raw SQL INSERT |
| `DoEvents` | Remove | Async by default |
| `Timer` | `setInterval` / RxJS | JS equivalent |
