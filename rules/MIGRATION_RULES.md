---
name: migration-rules
description: Mandatory rules and conventions for VB6 → Angular migration. ZONELESS Angular.
---

# Migration Rules v3.0 (Zoneless Angular)

## 📋 Naming Conventions

### Files

| VB6           | Angular                 | Example              |
| ------------- | ----------------------- | -------------------- |
| `FrmClientes` | `clientes.component.ts` | Kebab-case, singular |
| `ModUtils`    | `utils.service.ts`      | Service suffix       |
| `ClsPersona`  | `persona.model.ts`      | Model suffix         |

### Variables

| VB6           | TypeScript         | Example             |
| ------------- | ------------------ | ------------------- |
| `strNombre`   | `nombre: string`   | No Hungarian prefix |
| `intCantidad` | `cantidad: number` | CamelCase           |
| `blnActivo`   | `activo: boolean`  | Explicit types      |

### Functions

| VB6                         | Angular               | Location         |
| --------------------------- | --------------------- | ---------------- |
| `Public Function` in `.bas` | `method()` in Service | `*.service.ts`   |
| `Private Sub` in `.frm`     | `private method()`    | `*.component.ts` |

---

## 🔒 Security Rules

### Prohibited

| ❌ NO                          | ✅ YES                 | Reason        |
| ------------------------------ | ---------------------- | ------------- |
| Hardcoded credentials          | Environment variables  | Security      |
| Dynamic SQL with concatenation | Prisma parameterized   | SQL Injection |
| `On Error Resume Next`         | Explicit `try/catch`   | Debugging     |
| Hardcoded `App.Path`           | Relative configuration | Portability   |

### Required

- JWT tokens in `localStorage` with expiration
- HTTPS in production
- Validation on frontend AND backend
- User input sanitization

---

## 🏗️ Architecture Rules (ZONELESS Angular)

### Frontend (Angular 21 - Zoneless)

| Rule                          | Description                                                                |
| ----------------------------- | -------------------------------------------------------------------------- |
| **Zoneless Change Detection** | Use `provideExperimentalZonelessChangeDetection()` - NO Zone.js!           |
| **OnPush MANDATORY**          | Every component MUST use `changeDetection: ChangeDetectionStrategy.OnPush` |
| **Standalone Components**     | NEVER use NgModules                                                        |
| **Signals for ALL state**     | Never use plain variables for component state                              |
| Reactive Forms                | Template-driven forms prohibited                                           |
| MatDialog for modals          | Don't use routes for edit forms                                            |
| Lucide for icons              | Material Icons as alternative                                              |

### Zoneless Prohibited

| ❌ Prohibited                     | ✅ Alternative                                 |
| --------------------------------- | ---------------------------------------------- |
| `import 'zone.js'`                | `provideExperimentalZonelessChangeDetection()` |
| `ChangeDetectionStrategy.Default` | `ChangeDetectionStrategy.OnPush`               |
| Plain variables for state         | `signal()`                                     |
| `ngOnInit` for data loading       | Constructor + `effect()`                       |
| `setTimeout` / `setInterval`      | `signal.set()` + `effect()`                    |
| `implements OnInit`               | Direct constructor initialization              |

### Backend (Express)

| Rule                       | Description                                                 |
| -------------------------- | ----------------------------------------------------------- |
| Raw SQL required           | Use `better-sqlite3` with parameterized queries — NO Prisma |
| Thin controllers           | Logic in Services                                           |
| Centralized error handling | `errorMiddleware`                                           |
| Pino for logging           | `console.log` prohibited                                    |

---

## 📊 Data Rules

### Type Migration

| Access/VB6 | SQLite          | TypeScript |
| ---------- | --------------- | ---------- |
| `Long`     | `INTEGER`       | `number`   |
| `Double`   | `REAL`          | `number`   |
| `String`   | `TEXT`          | `string`   |
| `Date`     | `TEXT (ISO)`    | `Date`     |
| `Currency` | `REAL`          | `number`   |
| `Boolean`  | `INTEGER (0/1)` | `boolean`  |
| `Null`     | `NULL`          | `\| null`  |

### Integrity

- All IDs are `autoincrement`
- Foreign Keys required
- Indexes on frequently searched fields
- Cascade delete only if logically correct

### Database Integrity Requirements

- **Timestamps:** Mandatory `createdAt` and `updatedAt` on all models.
- **Soft Deletes:** Mandatory `deletedAt DateTime?` on all models.
- **Strict Relations:** All `@relation` keys MUST have an explicit `@@index([])` to prevent N+1 queries.
- **Strict IDs:** All IDs are `autoincrement`.

## ✅ Quality Rules

### Code

- ESLint + Prettier required
- 0 errors from `ng lint` and `tsc --noEmit`
- Comments only for complex logic
- Descriptive names (no abbreviations)

### Testing (MANDATORY)

| Metric              | Minimum  | Enforcement                 |
| ------------------- | -------- | --------------------------- |
| Line Coverage       | 80%      | Jest `--coverage`           |
| Branch Coverage     | 70%      | Jest `--coverage`           |
| Critical Path Tests | Required | Login, main CRUD, workflows |

### Testing Tools

| Layer         | Tool           | Purpose                 |
| ------------- | -------------- | ----------------------- |
| Unit Backend  | Jest           | Services, Controllers   |
| Unit Frontend | Jest + TestBed | Components, Services    |
| Contract      | Jest           | API Contract Validation |
| Coverage      | Istanbul/c8    | Threshold enforcement   |

### Testing Requirements

1. Every backend service MUST have unit tests
2. Every Angular component with logic MUST have unit tests
3. Tests MUST be generated automatically from VB6 analysis
4. Coverage reports MUST be generated in `analysis/coverage/`
5. NO deployment without passing all tests

### Git

- Descriptive commits (not "fix", "update")
- 1 feature = 1 branch
- PR required for `main`
- CI must run tests before merge

---

## 🚫 Prohibited Patterns

| ❌ Prohibited                    | ✅ Alternative                                 |
| -------------------------------- | ---------------------------------------------- |
| `import 'zone.js'`               | `provideExperimentalZonelessChangeDetection()` |
| `@NgModule`                      | Standalone components                          |
| `any` in TypeScript              | Explicit types                                 |
| `innerHTML` with user input      | Angular binding `[innerText]`                  |
| Nested callbacks                 | Async/await or RxJS                            |
| `setTimeout` for sync            | Signals + effects                              |
| Global variables                 | Services with `providedIn: 'root'`             |
| `implements OnInit` for data     | Constructor initialization                     |
| Plain class properties for state | `signal()`                                     |

---

## 🚦 Inter-Phase Gate Conditions

> [!IMPORTANT]
> Each phase MUST pass its exit gate before the next phase begins.
> Gates are enforced by the `build-ci` agent and reviewer skills.

### Gate: Phase 1 → Phase 2 (Analysis → Backend)

| Check               | Tool                           | Pass Criteria                           |
| ------------------- | ------------------------------ | --------------------------------------- |
| Inventory generated | `vb6_comprehensive_scanner.py` | `inventory.json` exists and has ≥1 form |
| Schema extracted    | `vb6_schema_extractor.py`      | `schema.json` exists and has ≥1 table   |
| Metrics generated   | `vb6_metrics_analyzer.py`      | `metrics.json` exists                   |
| HTML report         | `html_report_generator.py`     | `REPORT.html` exists                    |

### Gate: Phase 2 → Phase 3 (Backend → Frontend)

| Check               | Tool                                  | Pass Criteria                           |
| ------------------- | ------------------------------------- | --------------------------------------- |
| TypeScript compiles | `tsc --noEmit`                        | Exit code 0                             |
| Schema applies      | `sqlite3 db/database.db < schema.sql` | Exit code 0                             |
| Database created    | sqlite3                               | `.db` file exists with correct schema   |
| Swagger generated   | manual                                | `swagger.json` or `swagger.yaml` exists |
| Security audit      | `security_audit.py`                   | 0 CRITICAL findings                     |

### Gate: Phase 3 → Phase 4 (Frontend → Testing)

| Check               | Tool                    | Pass Criteria       |
| ------------------- | ----------------------- | ------------------- |
| Frontend builds     | `ng build`              | Exit code 0         |
| Lint passes         | `ng lint`               | 0 errors            |
| A11y audit          | `a11y_audit.py`         | 0 CRITICAL findings |
| Contract validation | `contract_validator.py` | 0 CRITICAL findings |
| Parity check        | `parity_checker.py`     | ≥ 80% parity        |

### Gate: Phase 4 → Phase 5 (Testing → Quality)

| Check           | Tool                    | Pass Criteria               |
| --------------- | ----------------------- | --------------------------- |
| Unit tests pass | `npm test`              | All tests pass              |
| Coverage met    | `coverage_validator.py` | Lines ≥ 80%, Branches ≥ 70% |

### Gate: Phase 5 → Deploy (Quality → Production)

| Check                | Tool                                  | Pass Criteria |
| -------------------- | ------------------------------------- | ------------- |
| Production build     | `ng build --configuration production` | Exit code 0   |
| Backend build        | `npm run build` (backend)             | Exit code 0   |
| Security audit clean | `security_audit.py`                   | 0 CRITICAL    |
| Full parity          | `parity_checker.py`                   | 100% parity   |
