---
description: Migrates ALL VB6 Forms to Angular Components. FULLY AUTOMATED - COMPLETE MIGRATION.
---

// turbo-all

# Migrate UI Workflow v3.0 (Fully Automated)

## Execution Mode

| Setting | Value |
|---------|-------|
| **Confirmation Required** | ❌ NO |
| **Migration Scope** | 🔄 ALL FORMS |
| **Auto-Continue** | ✅ YES |
| **Sample Mode** | ❌ DISABLED |

---

## Step 1: Identify ALL Forms

From `VB6_INVENTORY.md`, get complete list of forms:

```
FrmDashboard.frm → dashboard.component
FrmCustomers.frm → customers.component + customer-dialog.component
FrmOrders.frm    → orders.component + order-dialog.component
FrmInventory.frm → inventory.component + inventory-dialog.component
FrmReports.frm   → reports.component
FrmLogin.frm     → login.component
...              → ... (ALL forms)
```

---

## Step 1.5: Design Commitment (UX/UI)

Before generating code, define the visual system:
1. **Audience & Density**: Determine if compact (enterprise) or comfortable.
2. **Color System**: Apply 60-30-10 rule for Material M3 palette.
3. **Typography**: Define font families.
4. **Output**: A documented design commitment to be injected into `styles.scss` during Scaffolding.

---

## Step 2: Generate ALL Components

For EACH form in the inventory:

### List Component
```bash
ng generate component components/[entity-name] --standalone
```

### Dialog Component
```bash
ng generate component components/[entity-name]-dialog --standalone
```

### Service
```bash
ng generate service services/[entity-name]
```

---

## Step 3: Implement Components (Auto)

For EACH entity, generate:

### List Component Features
- `mat-table` with ALL columns from VB6 grid
- Sorting support
- Filter/search functionality
- Actions column (edit, delete)
- Add button opening dialog
- **Loading state** (`mat-spinner`) and **Empty state** (Required by Rejection Rules)

### Dialog Component Features
- Reactive form with ALL fields from VB6 form
- **Visual Grouping**: Apply Miller's Law (sections of 5-7 fields max via `mat-divider` or CSS grid)
- Validation matching VB6 logic
- Create and Edit modes
- Cancel and Save buttons
- Error display

---

## Step 4: Generate ALL Routes

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  // ALL other routes generated here
];
```

---

## Step 5: VB6 → Angular Mapping (Complete)

### Controls
| VB6 Control | Angular Material | Generated |
|-------------|------------------|-----------|
| TextBox | mat-form-field + input | ✅ All |
| CommandButton | mat-raised-button | ✅ All |
| DataGrid | mat-table | ✅ All |
| ComboBox | mat-select | ✅ All |
| CheckBox | mat-checkbox | ✅ All |
| Label | span / mat-label | ✅ All |
| DateTimePicker | mat-datepicker | ✅ All |

### Events
| VB6 Event | Angular | Generated |
|-----------|---------|-----------|
| Form_Load | ngOnInit() | ✅ All |
| Click | (click) | ✅ All |
| Change | (input) / reactive | ✅ All |
| LostFocus | (blur) | ✅ All |

---

## Step 6: Validate Code & Formatting

```bash
ng lint
ng build --configuration development
ng test --watch=false --browsers=ChromeHeadless
```

---

## Step 7: UX & Accessibility Audit

1. Run Python UX Script (from `frontend-design` skill):
```bash
python .agent/skills/frontend-design/scripts/ux_audit.py ./
```
2. Apply `web-design-guidelines` skill to audit generated components for WCAG 2.1 AA compliance (ARIA labels, contrast).

---

## Output

Complete Angular application with:
- ✅ ALL list components
- ✅ ALL dialog components  
- ✅ ALL services
- ✅ Complete routing
- ✅ Auth guard
- ✅ Error interceptor
- ✅ **Custom Material M3 Theme (NO defaults)**
- ✅ **UX & Accessibility Audited**

**No forms skipped. No samples. Complete migration.**
