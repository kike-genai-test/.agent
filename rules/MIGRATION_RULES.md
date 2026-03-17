---
name: migration-rules
description: Mandatory rules and conventions for legacy → Angular migration. Supports VB6 and AngularJS sources. ZONELESS Angular target.
---

# Migration Rules v4.0 (Multi-Technology, Zoneless Angular)

## 📋 Naming Conventions

### From VB6
| VB6 | Angular | Example |
|-----|---------|---------|
| `Frm[Entity]` | `[entity].component.ts` | Kebab-case, singular |
| `Mod[Utils]` | `[utils].service.ts` | Service suffix |
| `Cls[Model]` | `[model].model.ts` | Model suffix |

### From AngularJS
| AngularJS | Angular | Example |
|-----------|---------|---------|
| `[Entity]Controller` / `[Entity]Ctrl` | `[entity].component.ts` | Kebab-case, standalone |
| `[Entity]Service` / `[Entity]Factory` | `[entity].service.ts` | Injectable service |
| `[entity]Directive` (element) | `[entity].component.ts` | Standalone component |
| `[entity]Directive` (attribute) | `[entity].directive.ts` | Angular directive |
| `[entity]Filter` | `[entity].pipe.ts` | Standalone pipe |

### Variables (All Sources)
| Legacy | TypeScript | Example |
|--------|------------|---------|
| VB6: `strNombre` | `nombre: string` | No Hungarian prefix |
| VB6: `intCantidad` | `cantidad: number` | CamelCase |
| AngularJS: `$scope.nombre` | `nombre = signal<string>('')` | Signal-based state |
| AngularJS: `$scope.items` | `items = signal<Item[]>([])` | Typed signal |

### Functions (All Sources)
| Legacy | Angular | Location |
|--------|---------|----------|
| VB6: `Public Function` in `.bas` | `method()` in Service | `*.service.ts` |
| VB6: `Private Sub` in `.frm` | `private method()` | `*.component.ts` |
| AngularJS: `$scope.method = function()` | `method()` | `*.component.ts` |
| AngularJS: `service.method = function()` | `method()` | `*.service.ts` |

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

> **Note:** Database and backend rules apply when migrating full-stack (e.g., VB6). For frontend-only migrations (e.g., AngularJS), these sections are optional — skip to Quality Rules if the existing backend is kept.

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
1. Every backend service MUST have unit tests (when backend is generated)
2. Every Angular component with logic MUST have unit tests
3. Tests MUST be generated automatically from legacy analysis (VB6 or AngularJS)
4. Coverage reports MUST be generated in `analysis/coverage/`
5. NO deployment without passing all tests

### Git
- Descriptive commits (not "fix", "update")
- 1 feature = 1 branch
- PR required for `main`
- CI must run tests before merge

---

## 🚫 Prohibited Patterns (Target Angular)

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

## 🚫 Prohibited Patterns (AngularJS Remnants)

> When migrating from AngularJS, these legacy patterns MUST NOT appear in the target code:

| ❌ Prohibited (AngularJS Remnant) | ✅ Modern Equivalent |
|-----------------------------------|----------------------|
| `$scope` / `$rootScope` | `signal()` / shared service |
| `$watch` / `$watchCollection` | `effect()` / `computed()` |
| `$apply()` / `$digest()` | Remove entirely (Zoneless handles it) |
| `$broadcast` / `$emit` / `$on` | Service with signals or `@Output()` |
| `$http` | `HttpClient` with typed responses |
| `$q` / `$q.defer()` | Native `Promise` or RxJS `Observable` |
| `$timeout` / `$interval` | `setTimeout` / `setInterval` or `effect()` |
| `angular.element()` / jQuery | `Renderer2` or native DOM with signals |
| `$compile` | Component composition |
| `$templateCache` | Component templates |
| `ng-controller` | `@Component` standalone |
| `ng-repeat` | `@for` block syntax |
| `ng-if` / `ng-show` / `ng-hide` | `@if` block syntax |
| `ng-model` (template-driven) | `formControl` (ReactiveFormsModule) |
| `ng-include` | Component composition |
| `$location` | Angular `Router` |
| `$cookies` | Direct `document.cookie` or service |

---

## 🚦 Inter-Phase Gate Conditions

> [!IMPORTANT]
> Each phase MUST pass its exit gate before the next phase begins.
> Gates are enforced by the `build-ci` agent and reviewer skills.
> Gate structure varies by source technology.

### VB6 Pipeline Gates

#### Gate: Phase 1 → Phase 2 (Analysis → Database)
| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Inventory generated | `vb6_comprehensive_scanner.py` | `inventory.json` exists and has ≥1 form |
| Schema extracted | `vb6_schema_extractor.py` | `schema.json` exists and has ≥1 table |
| Metrics generated | `vb6_metrics_analyzer.py` | `metrics.json` exists |
| HTML report | `html_report_generator.py` | `REPORT.html` exists |

#### Gate: Phase 2 → Phase 3 (Database → Backend)
| Check | Tool | Pass Criteria |
|-------|------|---------------|
| TypeScript compiles | `tsc --noEmit` | Exit code 0 |
| Schema applies | `sqlite3 db/database.db < schema.sql` | Exit code 0 |
| Database created | `sqlite3` | `.db` file exists with correct schema |
| Swagger generated | manual | `swagger.json` or `swagger.yaml` exists |
| Security audit | `security_audit.py` | 0 CRITICAL findings |

#### Gate: Phase 3 → Phase 4 (Backend → Frontend)
| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Frontend builds | `ng build` | Exit code 0 |
| Lint passes | `ng lint` | 0 errors |
| A11y audit | `a11y_audit.py` | 0 CRITICAL findings |
| Contract validation | `contract_validator.py` | 0 CRITICAL findings |
| Parity check | `parity_checker.py` | ≥ 80% parity |

#### Gate: Phase 4 → Phase 5 (Frontend → Testing)
| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Unit tests pass | `npm test` | All tests pass |
| Coverage met | `coverage_validator.py` | Lines ≥ 80%, Branches ≥ 70% |

### AngularJS Pipeline Gates

#### Gate: Phase 1 → Phase 2 (Analysis → Frontend)
| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Inventory generated | `angularjs_comprehensive_scanner.py` | `inventory.json` exists and has ≥1 controller |
| Patterns extracted | `angularjs_pattern_extractor.py` | `patterns.json` exists |
| Routes extracted | `angularjs_route_extractor.py` | `routes.json` exists |
| Metrics generated | `angularjs_metrics_analyzer.py` | `metrics.json` exists |
| HTML report | `html_report_generator.py` | `REPORT.html` exists |

#### Gate: Phase 2 → Phase 3 (Frontend → Testing)
| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Frontend builds | `ng build` | Exit code 0 |
| Lint passes | `ng lint` | 0 errors |
| A11y audit | `a11y_audit.py` | 0 CRITICAL findings |

#### Gate: Phase 3 → Deploy (Testing → Production)
| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Unit tests pass | `npm test` | All tests pass |
| Coverage met | `coverage_validator.py` | Lines ≥ 80%, Branches ≥ 70% |

### Common Gate: Deploy Readiness (All Pipelines)
| Check | Tool | Pass Criteria |
|-------|------|---------------|
| Production build | `ng build --configuration production` | Exit code 0 |
| Backend build (if applicable) | `npm run build` (backend) | Exit code 0 |
| Security audit clean | `security_audit.py` | 0 CRITICAL |
| Full parity | `parity_checker.py` | 100% parity |

