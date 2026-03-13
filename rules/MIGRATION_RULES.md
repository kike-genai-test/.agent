---
name: migration-rules
description: Mandatory rules and conventions for VB6 → Angular migration. ZONELESS Angular.
---

# Migration Rules v3.0 (Zoneless Angular)

## 📋 Naming Conventions

### Files
| VB6 | Angular | Example |
|-----|---------|---------|
| `Frm[Entity]` | `[entity].component.ts` | Kebab-case, singular |
| `Mod[Utils]` | `[utils].service.ts` | Service suffix |
| `Cls[Model]` | `[model].model.ts` | Model suffix |

### Variables
| VB6 | TypeScript | Example |
|-----|------------|---------|
| `strNombre` | `nombre: string` | No Hungarian prefix |
| `intCantidad` | `cantidad: number` | CamelCase |
| `blnActivo` | `activo: boolean` | Explicit types |

### Functions
| VB6 | Angular | Location |
|-----|---------|----------|
| `Public Function` in `.bas` | `method()` in Service | `*.service.ts` |
| `Private Sub` in `.frm` | `private method()` | `*.component.ts` |

---

## 🔒 Security Rules

### Prohibited
| ❌ NO | ✅ YES | Reason |
|-------|--------|--------|
| Hardcoded credentials | Environment variables | Security |
| Dynamic SQL with concatenation | Parameterized queries (`node:sqlite` `?` placeholders) | SQL Injection |
| `On Error Resume Next` | Explicit `try/catch` | Debugging |
| Hardcoded `App.Path` | Relative configuration | Portability |

### Required
- JWT tokens in `localStorage` with expiration
- HTTPS in production
- Validation on frontend AND backend
- User input sanitization

---

## 🏗️ Architecture Rules (ZONELESS Angular)

### Frontend (Angular 21 - Zoneless)
| Rule | Description |
|------|-------------|
| **Zoneless Change Detection** | Use `provideZonelessChangeDetection()` - NO Zone.js! (Angular 21+: the `Experimental` variant was removed) |
| **OnPush MANDATORY** | Every component MUST use `changeDetection: ChangeDetectionStrategy.OnPush` |
| **Standalone Components** | NEVER use NgModules |
| **Signals for ALL state** | Never use plain variables for component state |
| Reactive Forms | Template-driven forms prohibited |
| MatDialog for modals | Don't use routes for edit forms |
| Lucide for icons | Material Icons as alternative |

### Zoneless Prohibited
| ❌ Prohibited | ✅ Alternative |
|---------------|----------------|
| `import 'zone.js'` | `provideZonelessChangeDetection()` |
| `provideExperimentalZonelessChangeDetection()` | `provideZonelessChangeDetection()` (Angular 21+) |
| `ChangeDetectionStrategy.Default` | `ChangeDetectionStrategy.OnPush` |
| Plain variables for state | `signal()` |
| `ngOnInit` for data loading | Constructor + `effect()` |
| `setTimeout` / `setInterval` | `signal.set()` + `effect()` |
| `implements OnInit` | Direct constructor initialization |

### Backend (Express + Raw SQL)
| Rule | Description |
|------|-------------|
| **Raw SQL with `node:sqlite`** | Use the builtin `node:sqlite` module (Node v22+). **NO Prisma, NO `better-sqlite3`** |
| **`bcryptjs` for hashing** | Pure JS, no native bindings. **`bcrypt` (native) is PROHIBITED** |
| **`tsx` for dev server** | `tsx watch src/app.ts`. **`ts-node` / `ts-node-dev` are PROHIBITED** |
| **Separate tsconfig for build** | `tsconfig.json` (includes specs) + `tsconfig.build.json` (excludes specs) |
| **`scripts/init-db.ts`** | Seed data with bcrypt hashes computed at runtime. **Hardcoded hashes in seed.sql are PROHIBITED** |
| Thin controllers | Logic in Services |
| Centralized error handling | `errorMiddleware` |
| Pino for logging | `console.log` prohibited |


---

## 📊 Data Rules

### DB Architecture (SQLite with Raw SQL)

| Principle | Execution |
|-----------|-----------|
| **Single Source of Truth** | All Database principles MUST follow the `database-stack` skill. |
| **Legacy Type Mapping** | Refer exclusively to the type mapping table below and `.agent/skills/database-stack/legacy-mapping.md`. Do not invent random types. |
| **Quality Gates** | The DB Schema cannot be migrated until validated with `sqlite3 db/database.db ".schema"`. |

### Type Migration (Access/VB6 → SQLite → TypeScript)

| Access/VB6 | SQLite          | TypeScript |
|------------|-----------------|------------|
| `Long`     | `INTEGER`       | `number`   |
| `Double`   | `REAL`          | `number`   |
| `String`   | `TEXT`          | `string`   |
| `Date`     | `TEXT (ISO)`    | `Date`     |
| `Currency` | `REAL`          | `number`   |
| `Boolean`  | `INTEGER (0/1)` | `boolean`  |
| `Null`     | `NULL`          | `| null`   |

### Database Integrity Requirements
- **Timestamps:** Mandatory `created_at` and `updated_at` on all tables (use `datetime('now')`).
- **Soft Deletes:** Mandatory `activo INTEGER DEFAULT 1` or `deleted_at TEXT` on all tables.
- **Foreign Keys:** All FK constraints enforced with `PRAGMA foreign_keys = ON`.
- **Indexes:** On frequently searched fields to prevent slow queries.
- **Strict IDs:** All IDs are `INTEGER PRIMARY KEY AUTOINCREMENT`.

## ✅ Quality Rules

### Code
- ESLint + Prettier required
- 0 errors from `ng lint` and `tsc --noEmit`
- Comments only for complex logic
- Descriptive names (no abbreviations)

### Testing (MANDATORY)
| Metric | Minimum | Enforcement |
|--------|---------|-------------|
| Line Coverage | 80% | Jest `--coverage` |
| Branch Coverage | 70% | Jest `--coverage` |
| Critical Path Tests | Required | Login, main CRUD, workflows |

### Testing Tools
| Layer | Tool | Purpose |
|-------|------|---------|
| Unit Backend | Jest | Services, Controllers |
| Unit Frontend | Jest + TestBed | Components, Services |
| Contract | Jest | API Contract Validation |
| Coverage | Istanbul/c8 | Threshold enforcement |

### Testing Requirements
1. Every backend service MUST have unit tests
2. Every Angular component with logic MUST have unit tests
3. Tests MUST be generated automatically from VB6 analysis
5. Coverage reports MUST be generated in `analysis/coverage/`
6. NO deployment without passing all tests

### Git
- Descriptive commits (not "fix", "update")
- 1 feature = 1 branch
- PR required for `main`
- CI must run tests before merge

---

## 🚫 Prohibited Patterns

| ❌ Prohibited | ✅ Alternative |
|---------------|----------------|
| `import 'zone.js'` | `provideZonelessChangeDetection()` |
| `provideExperimentalZonelessChangeDetection()` | `provideZonelessChangeDetection()` (removed in Angular 21) |
| `@NgModule` | Standalone components |
| `any` in TypeScript | Explicit types |
| `innerHTML` with user input | Angular binding `[innerText]` |
| Nested callbacks | Async/await or RxJS |
| `setTimeout` for sync | Signals + effects |
| Global variables | Services with `providedIn: 'root'` |
| `implements OnInit` for data | Constructor initialization |
| Plain class properties for state | `signal()` |
| `better-sqlite3` | `node:sqlite` (builtin Node v22+, no native bindings) |
| `bcrypt` (native) | `bcryptjs` (pure JS, no native bindings) |
| `ts-node` / `ts-node-dev` | `tsx watch` (fast startup, no config) |
| Hardcoded bcrypt hash in seed.sql | `scripts/init-db.ts` with `bcrypt.hashSync()` at runtime |

---

## 🚦 Inter-Phase Gate Conditions

> [!IMPORTANT]
> Each phase MUST pass its exit gate before the next phase begins.
> Gates are enforced by the `build-ci` agent and reviewer skills.

### Gate: Phase 1 → Phase 2 (Analysis → Backend)
| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Inventory generated | `vb6_comprehensive_scanner.py` | `inventory.json` exists and has ≥1 form |
| Schema extracted | `vb6_schema_extractor.py` | `schema.json` exists and has ≥1 table |
| Metrics generated | `vb6_metrics_analyzer.py` | `metrics.json` exists |
| HTML report | `html_report_generator.py` | `REPORT.html` exists |

### Gate: Phase 2 → Phase 3 (Backend → Frontend)
| Check | Tool | Pass Criteria |
|-------|------|---------------|
| TypeScript compiles | `tsc --noEmit` | Exit code 0 |
| Schema applies | `sqlite3 db/database.db < schema.sql` | Exit code 0 |
| Database created | `sqlite3` | `.db` file exists with correct schema |
| Swagger generated | manual | `swagger.json` or `swagger.yaml` exists |
| Security audit | `security_audit.py` | 0 CRITICAL findings |

### Gate: Phase 3 → Phase 4 (Frontend → Testing)
| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Frontend builds | `ng build` | Exit code 0 |
| Lint passes | `ng lint` | 0 errors |
| A11y audit | `a11y_audit.py` | 0 CRITICAL findings |
| Contract validation | `contract_validator.py` | 0 CRITICAL findings |
| Parity check | `parity_checker.py` | ≥ 80% parity |

### Gate: Phase 4 → Phase 5 (Testing → Quality)
| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Unit tests pass | `npm test` | All tests pass |
| Coverage met | `coverage_validator.py` | Lines ≥ 80%, Branches ≥ 70% |

### Gate: Phase 5 → Deploy (Quality → Production)
| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Production build | `ng build --configuration production` | Exit code 0 |
| Backend build | `npm run build` (backend) | Exit code 0 |
| Security audit clean | `security_audit.py` | 0 CRITICAL |
| Full parity | `parity_checker.py` | 100% parity |

