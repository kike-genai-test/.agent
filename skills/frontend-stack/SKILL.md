---
name: frontend-stack
description: Complete specifications and patterns for the target Angular stack (Angular 21+, Zoneless, Material).
model: gemini-3.1-pro-high
allowed-tools: view_file, write_to_file, run_command
---

# Frontend Stack Manual v4.0 (Zoneless)

## 📦 Version Requirements

| Technology | Version | Package |
|------------|---------|---------|
| **Angular** | 21+ | `@angular/core` |
| **Angular Material** | 21+ | `@angular/material` |
| **Material Icons** | Latest | `Material Symbols / Icons` |

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

### Reactive State Validation (Generic Pattern)
When migrating complex legacy logic that requires computing warnings or derived states before taking an action:

```typescript
// Example: Derived state warning
activeOrders = signal<Order[]>([]);
showOverdueWarning = computed(() => {
  return this.activeOrders().some(order => order.isOverdue);
});

async onCustomerSelected(customerId: number) {
  this.selectedCustomerId.set(customerId);
  const orders = await this.orderService.getActive(customerId);
  this.activeOrders.set(orders);
}
```

```html
<!-- Show warnings based on computed signals -->
@if (showOverdueWarning()) {
<div class="warning-box">
  <mat-icon>warning</mat-icon>
  <strong>This customer has overdue orders!</strong>
</div>
}
```

### Derived Calculations (Signals)
```typescript
// Replace legacy imperative calculations with computed signals
projectedEndDate = computed(() => {
  const start = this.startDate();
  if (!start) return null;
  
  const d = new Date(start);
  d.setDate(d.getDate() + this.durationDays());
  return d;
});
```

## 1.2 Angular Material M3 Theming

> [!IMPORTANT]
> Always define a custom Material 3 theme based on the Design Commitment. **NEVER use the default purple/blue.**

### custom-theme.scss Pattern
Generate a specific color palette using the 60-30-10 design principle:

```scss
@use '@angular/material' as mat;

// Include the core Material styles
@include mat.core();

// Define a custom M3 theme (e.g., Emerald/Teal primary for corporate/calm)
$my-app-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$teal-palette, // 30% Key actions
    tertiary: mat.$orange-palette // 10% Accent/CTAs
  ),
  typography: (
    brand-family: 'Inter, sans-serif',
    plain-family: 'Roboto, sans-serif',
  ),
  density: (
    scale: 0 // -1 for higher density (enterprise lists)
  )
));

// Apply the theme to the entire app
:root {
  @include mat.all-component-themes($my-app-theme);
  
  // Custom global variables inspired by the theme
  --background-color: #f8fafc; // 60% Background
}

body {
  background-color: var(--background-color);
  margin: 0;
  font-family: Roboto, "Helvetica Neue", sans-serif;
}
```

## 1.3 Angular Material + UI

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

## 1.4 Reactive Forms

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

## 1.5 HTTP Client + Error Interceptor

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


## 1.6 Navigation & Layout (CRITICAL for UX)

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
    { path: '/customers', icon: 'people', label: 'Customers' },
    { path: '/orders', icon: 'shopping_cart', label: 'Orders' },
    { path: '/inventory', icon: 'inventory', label: 'Inventory' },
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
      { path: 'customers', loadComponent: () => import('./components/customers/customers-list.component').then(m => m.CustomersListComponent) },
      // ... more child routes
    ]
  },
  { path: '**', redirectTo: 'login' }
];
```

> [!TIP]
> **VB6 Menu → Sidebar Mapping:**
> - `mnuFile` → Dashboard/Home
> - `mnuEntities` → /[entities]
> - `mnuSettings` → /settings
> - `mnuSalir` → Logout button in sidebar footer

## 1.7 Internationalization (i18n)

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

## 1.8 Feature Module Structure

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

# 2. 📋 VB6 → Modern Mapping Reference

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
| `DoEvents` | Remove | Async by default |
| `Timer` | `setInterval` / RxJS | JS equivalent |
