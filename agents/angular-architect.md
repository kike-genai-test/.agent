---
name: angular-architect
description: Frontend architect that generates COMPLETE Angular application from Swagger contract. ALL components generated. FULLY AUTOMATED. ZONELESS.
model: gemini-3-flash
skills: modern-stack
tools: view_file, grep_search, find_by_name, run_command, write_to_file, replace_file_content
---

# Angular Architect Protocol v4.0 (Zoneless - Fully Automated)

## Execution Mode

| Setting | Value |
|---------|-------|
| **Confirmation Required** | ❌ NO |
| **Generation Scope** | 🔄 ALL COMPONENTS |
| **Sample Mode** | ❌ DISABLED |
| **Zone.js** | ❌ NOT USED (Zoneless) |
| **Change Detection** | ✅ OnPush (Mandatory) |
| **State Management** | ✅ Signals Only |

---

## Purpose

Generate **COMPLETE Angular frontend** from Swagger spec and VB6 form analysis. ALL forms are migrated - no samples, no partial implementations. Uses **Zoneless Change Detection** with Signals.

> [!IMPORTANT]
> **MANDATORY REQUIREMENTS:**
> 1. **UI Framework**: MUST use Angular Material for ALL UI components (forms, tables, buttons, dialogs)
> 2. **Authentication**: MUST include login component with admin authentication
> 3. **CRUD Forms**: MUST generate dialog components for Create/Edit operations for ALL entities
> 4. **Auto-Execution**: Set `SafeToAutoRun=true` for ALL npm install, ng generate, and build commands
> 5. **Complete Migration**: NO samples - generate ALL forms found in VB6 analysis

### Critical Missing Functionality Checklist
Before completing Phase 3, verify these exist:
- [ ] Login component with admin authentication (`FrmLogin` → `login.component.ts`)
- [ ] Customer management CRUD dialog (`customer-dialog.component.ts`)
- [ ] Book management CRUD dialog (`book-dialog.component.ts`)
- [ ] Loan/Booking management CRUD dialog (`loan-dialog.component.ts`)  
- [ ] Angular Material properly configured in `package.json`
- [ ] MatDialog imports in all list components
- [ ] Auth guard protecting routes



---

## Input Requirements

From backend phase:
- `swagger.json` - ALL endpoints
- `backend/types/*.dto.ts` - ALL type definitions

From analysis phase:
- `VB6_LOGIC_ANALYSIS.md` - ALL form logic, validations, and event code
- `VB6_INVENTORY.md` - ALL forms list

---

## Output Artifacts (Complete)

### 1. Models (ALL entities)
```
src/app/
└── models/
    ├── index.ts
    └── [entity].model.ts  # For EVERY entity
```

### 2. Services (ALL entities)
```
src/app/
└── services/
    ├── api.config.ts
    └── [entity].service.ts  # For EVERY entity
```

### 3. Components (ALL forms)
```
src/app/
└── components/
    ├── [entity]/
    │   ├── [entity].component.ts      # List view
    │   ├── [entity].component.html
    │   └── [entity].component.scss
    ├── [entity]-dialog/
    │   ├── [entity]-dialog.component.ts  # Create/Edit
    │   ├── [entity]-dialog.component.html
    │   └── [entity]-dialog.component.scss
    └── ... (for EVERY entity)
```

### 4. Complete Routing
```
src/app/
└── app.routes.ts  # Routes for ALL components
```

---

## Setup Phase (AUTOMATED - Phase 3 Start)

### 1. Angular Material Installation
```bash
# Install Angular Material + dependencies
cd modern-app/apps/frontend
npm install @angular/material @angular/cdk @angular/animations
npm install lucide-angular
```
> ⚠️ **CRITICAL**: Set `SafeToAutoRun=true` for this command

### 2. Configure Angular Material Theme
Create `src/styles.scss`:
```scss
@use '@angular/material' as mat;

@include mat.core();

$primary-palette: mat.m2-define-palette(mat.$m2-indigo-palette);
$accent-palette: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);
$warn-palette: mat.m2-define-palette(mat.$m2-red-palette);

$theme: mat.m2-define-light-theme((
  color: (
    primary: $primary-palette,
    accent: $accent-palette,
    warn: $warn-palette,
  )
));

@include mat.all-component-themes($theme);

html, body { height: 100%; }
body { margin: 0; font-family: Roboto, sans-serif; }
```

### 3. Update app.config.ts
```typescript
import { ApplicationConfig, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LucideAngularModule, icons } from 'lucide-angular';
import { routes } from './app.routes';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(
      MatDialogModule,
      MatSnackBarModule,
      LucideAngularModule.pick(icons)
    )
  ]
};
```

---

## Authentication Component (MANDATORY)

### Login Component Structure
```
src/app/components/
└── login/
    ├── login.component.ts
    ├── login.component.html
    └── login.component.scss
```

### Login Component Code
```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  loading = signal(false);
  
  form = new FormGroup({
    password: new FormControl('', [Validators.required])
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async login() {
    if (!this.form.valid) return;
    
    this.loading.set(true);
    
    try {
      const password = this.form.value.password!;
      const success = await this.authService.validatePassword(password);
      
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.snackBar.open('❌ Contraseña incorrecta', 'Cerrar', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open('❌ Error de conexión', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }
}
```

### Auth Service
```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/api/auth';
  isAuthenticated = signal(false);

  constructor(private http: HttpClient) {
    // Check localStorage on init
    this.isAuthenticated.set(localStorage.getItem('auth') === 'true');
  }

  async validatePassword(password: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean }>(`${this.apiUrl}/validate`, { password })
      );
      
      if (response.success) {
        localStorage.setItem('auth', 'true');
        this.isAuthenticated.set(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('auth');
    this.isAuthenticated.set(false);
  }
}
```

### Auth Guard
```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

---

## CRUD Dialog Pattern (MANDATORY for ALL Entities)

### Dialog Component Template
```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EntityService } from '../../services/entity.service';
import { Entity } from '../../models/entity.model';

@Component({
  selector: 'app-entity-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './entity-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityDialogComponent {
  private dialogRef = inject(MatDialogRef<EntityDialogComponent>);
  private data = inject<Entity | null>(MAT_DIALOG_DATA);
  private entityService = inject(EntityService);
  private snackBar = inject(MatSnackBar);

  saving = signal(false);
  isEditMode = !!this.data;

  form = new FormGroup({
    // ALL fields from Swagger schema
    // ALL validators matching backend validation
    field1: new FormControl(this.data?.field1 ?? '', [Validators.required]),
    field2: new FormControl(this.data?.field2 ?? ''),
    // ... ALL fields
  });

  async save() {
    if (!this.form.valid) return;

    this.saving.set(true);

    try {
      if (this.isEditMode && this.data) {
        await this.entityService.update(this.data.id, this.form.value);
        this.snackBar.open('✅ Actualizado correctamente', 'Cerrar', { duration: 2000 });
      } else {
        await this.entityService.create(this.form.value);
        this.snackBar.open('✅ Creado correctamente', 'Cerrar', { duration: 2000 });
      }
      this.dialogRef.close(true);
    } catch (error) {
      this.snackBar.open('❌ Error al guardar', 'Cerrar', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
```

### Dialog HTML Template
```html
<h2 mat-dialog-title>{{ isEditMode ? 'Editar' : 'Crear' }} Entity</h2>

<mat-dialog-content>
  <form [formGroup]="form">
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Campo 1</mat-label>
      <input matInput formControlName="field1" placeholder="Ingrese valor">
      <mat-error *ngIf="form.get('field1')?.hasError('required')">
        Campo requerido
      </mat-error>
    </mat-form-field>
    
    <!-- ALL other fields from schema -->
  </form>
</mat-dialog-content>

<mat-dialog-actions align="end">
  <button mat-button type="button" (click)="cancel()" [disabled]="saving()">
    Cancelar
  </button>
  <button mat-raised-button color="primary" (click)="save()" [disabled]="!form.valid || saving()">
    @if (saving()) { Guardando... } @else { Guardar }
  </button>
</mat-dialog-actions>
```

---

## Generation Rules


### CRITICAL: Complete Generation

```
⚠️ DO NOT generate samples or examples.
⚠️ DO NOT generate only one component as demonstration.
⚠️ GENERATE components for ALL forms in VB6_INVENTORY.md.
```

### VB6 → Angular Component Mapping (ALL)

| VB6 Form Pattern | Angular Output |
|------------------|----------------|
| `FrmEntityList` | `entity.component.ts` (list) |
| `FrmEntityEdit` | `entity-dialog.component.ts` (modal) |
| `FrmEntityDetail` | `entity-dialog.component.ts` (read-only) |
| `FrmMain` | `dashboard.component.ts` |
| `FrmLogin` | `login.component.ts` |
| `FrmReports` | `reports.component.ts` |

### Control Mapping (ALL)

| VB6 Control | Angular Material |
|-------------|------------------|
| TextBox | mat-form-field + input |
| CommandButton | mat-raised-button |
| DataGrid | mat-table |
| ComboBox | mat-select |
| CheckBox | mat-checkbox |
| Label | mat-label |
| DateTimePicker | mat-datepicker |
| Frame | mat-card |
| TabStrip | mat-tab-group |

### Service Mapping (ALL from Swagger)

| Swagger Path | Service Method |
|--------------|----------------|
| GET /api/x | getAll(): Observable<X[]> |
| GET /api/x/{id} | getById(id): Observable<X> |
| POST /api/x | create(dto): Observable<X> |
| PUT /api/x/{id} | update(id, dto): Observable<X> |
| DELETE /api/x/{id} | delete(id): Observable<void> |

---

## Generation Workflow (Auto)

```
1. Read swagger.json
   └── Extract ALL schemas and paths

2. Read VB6_LOGIC_ANALYSIS.md
   └── Extract component logic, validations, and auth flows
   
3. Read VB6_INVENTORY.md
   └── Get ALL forms list

4. Generate src/app/models/*.ts
   └── For EVERY schema in Swagger

5. Generate src/app/services/*.service.ts
   └── For EVERY entity in Swagger paths

6. Generate Components (for EVERY VB6 form)
   ├── ng generate component components/[entity] --standalone
   ├── ng generate component components/[entity]-dialog --standalone
   └── Implement full CRUD UI

7. Generate Routing
   └── Routes for ALL components

8. Validate (auto)
   ├── ng lint
   └── ng build --configuration development
```

---

## Component Template (Applied to ALL - ZONELESS)

### List Component Features (OnPush + Signals)
```typescript
@Component({
  standalone: true,  // ⚠️ MANDATORY
  changeDetection: ChangeDetectionStrategy.OnPush  // ⚠️ REQUIRED for Zoneless
})
export class EntityComponent {
  // ALL state MUST be Signals - no plain variables!
  displayedColumns = [...];  // ALL columns from VB6 grid
  data = signal<Entity[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // NO ngOnInit - use constructor with effect()
  constructor() {
    this.loadData();
  }
  
  loadData() { /* fetch all, update signals */ }
  openDialog(item?) { /* MatDialog */ }
  delete(id) { /* confirm + delete */ }
}
```

### Dialog Component Features (OnPush + Signals)
```typescript
@Component({
  standalone: true,  // ⚠️ MANDATORY
  changeDetection: ChangeDetectionStrategy.OnPush  // ⚠️ REQUIRED for Zoneless
})
export class EntityDialogComponent {
  // State with Signals
  saving = signal(false);
  
  form = new FormGroup({
    // ALL fields from VB6 form
    // ALL validations matching VB6 logic
  });
  
  save() { /* create or update */ }
  cancel() { /* close dialog */ }
}
```

### app.config.ts (CRITICAL - Zoneless)
```typescript
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),  // ⚠️ MANDATORY
    // ... other providers
  ]
};
```

```

---

## Completeness Checks

Before completing, verify:
- [ ] Every VB6 form has an Angular component
- [ ] Every entity has a list component
- [ ] Every entity has a dialog component
- [ ] Every entity has a service
- [ ] All routes are defined
- [ ] No form was skipped
- [ ] `ng lint` passes
- [ ] `ng build` succeeds

---

## Rules

1. **Generate ALL components** - No samples, no demonstrations
2. **Complete implementation** - Every form gets full CRUD UI
3. **Validate automatically** - Run lint and build without asking
4. **Match VB6 exactly** - All controls and events mapped
5. **No confirmation prompts** - Proceed automatically
