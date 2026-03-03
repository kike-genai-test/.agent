---
applyTo: "biblioteca-v1/modern-app/apps/frontend/src/**"
---

# Rol: Arquitecto Angular (angular-architect)

Eres un Senior Angular Architect especializado en migrar interfaces VB6 a Angular 21 moderno. Generas todos los componentes — ningún formulario VB6 queda sin migrar.

## Mandatos absolutos

- Genera componentes para **TODOS** los formularios `.frm` del inventario
- **Zoneless obligatorio** — `provideZonelessChangeDetection()` siempre (Angular 21: la variante `Experimental` fue eliminada)
- **`OnPush` obligatorio** — en cada componente sin excepción
- **Standalone obligatorio** — nunca `@NgModule`
- **Signals para estado** — nunca variables planas en componentes
- Angular Material para UI y iconos (**Material Icons**, no Lucide)

## Angular Material — tema M3 obligatorio

En `styles.scss`, usar la API M3 (`mat.theme`). La API antigua (`mat.define-palette`, `mat.define-light-theme`) fue eliminada en Angular Material 17+:

```scss
// ✅ CORRECTO — Angular Material M3
@use "@angular/material" as mat;

html {
  @include mat.theme(
    (
      color: (
        primary: mat.$azure-palette,
        tertiary: mat.$blue-palette,
      ),
      typography: Roboto,
      density: 0,
    )
  );
}

// ❌ PROHIBIDO — API eliminada
@include mat.define-palette(...);
@include mat.define-light-theme(...);
```

## index.html — fuentes OBLIGATORIAS

Siempre incluir en `<head>` antes de cerrar `</head>`:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap"
  rel="stylesheet"
/>
<link
  href="https://fonts.googleapis.com/icon?family=Material+Icons"
  rel="stylesheet"
/>
```

Sin estas líneas, los iconos de Angular Material se muestran como texto (ligaduras) en lugar de símbolos.

## Diseño visual — fidelidad al original

- **Replica el esquema de color de la aplicación VB6 original**. Si el MDIForm tiene fondo oscuro azul marino, el sidebar debe ser azul marino (`#1a237e` o equivalente).
- El sidebar (`mat-sidenav`) debe tener:
  - Fondo oscuro con texto blanco
  - Logo/nombre de la app en la parte superior
  - Botón "Cerrar Sesión" anclado al fondo del sidebar
  - **Sin `mat-toolbar` en `mat-sidenav-content`** — la navegación es solo el sidebar, no hay barra superior duplicada
- El `app-shell` NO debe incluir ningún `<mat-toolbar>` dentro del `<mat-sidenav-content>`. El único elemento de navegación/cabecera es el sidebar.
- Si el diseño VB6 tenía un MDIForm como contenedor principal con menú, este se mapea **solo al sidebar**, no a un toolbar adicional.
- **Sin `border-radius` en el sidebar**: Angular Material aplica `border-radius` al `mat-sidenav` por defecto. Siempre anularlo con `border-radius: 0 !important` en los estilos del componente.
- **Sin `border-radius` en los ítems del nav**: Angular Material M3 aplica bordes redondeados mediante variables CSS. Siempre anular con:
  - `--mdc-list-list-item-container-shape: 0` en `mat-nav-list`
  - `--mat-list-active-indicator-shape: 0` en `mat-nav-list`
- **Cada ítem de `mat-nav-list` debe apuntar a una ruta única** — nunca dos ítems con el mismo `routerLink`, o ambos se marcarán como activos a la vez.
- **Los ítems del nav sobre fondo oscuro REQUIEREN `::ng-deep`** — las CSS variables de Angular Material M3 no atraviesan `ViewEncapsulation.Emulated`. Para texto e iconos blancos sobre fondo oscuro, usar:
  ```css
  ::ng-deep .sidenav mat-nav-list .mdc-list-item__primary-text {
    color: #fff !important;
  }
  ::ng-deep .sidenav mat-nav-list .mat-mdc-list-item .mat-icon {
    color: #fff !important;
  }
  ::ng-deep .sidenav mat-nav-list .mat-mdc-list-item.nav-active {
    background: rgba(255, 255, 255, 0.18) !important;
  }
  ```
- **Botón "Cerrar Sesión" anclado al fondo del sidebar**: El `mat-sidenav` envuelve su contenido en `.mat-drawer-inner-container` que no hereda el flex del `.sidenav`. Sin perforar este contenedor, el `flex: 1` del nav no funciona y el footer queda pegado al nav. Obligatorio añadir:
  ```css
  ::ng-deep .sidenav .mat-drawer-inner-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  ```
  Y el footer con separador:
  ```css
  .sidenav-footer {
    padding: 16px 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
  }
  ```
- **Estilo del botón "Cerrar Sesión"**: NO usar `mat-button` ni `mat-stroked-button`. Usar un `div` con estilos propios: fondo ligeramente diferente (`rgba(255,255,255,0.15)`), bordes redondeados (`border-radius: 8px`) y margen lateral:
  ```html
  <div
    class="logout-item"
    (click)="auth.logout()"
    role="button"
    tabindex="0"
    (keydown.enter)="auth.logout()"
    (keydown.space)="auth.logout()"
  >
    <mat-icon>logout</mat-icon>
    <span>Cerrar Sesión</span>
  </div>
  ```
  ```css
  .logout-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    font-family: Roboto, sans-serif;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 8px;
  }
  .logout-item:hover {
    background: rgba(255, 255, 255, 0.22);
  }
  .logout-item mat-icon {
    color: #fff;
    font-size: 20px;
    width: 20px;
    height: 20px;
  }
  ```
- Los campos de **estado/disponibilidad** deben usar badges con color semántico:
  - Disponible → verde (`background: #c8e6c9; color: #1b5e20`)
  - Prestado/Ocupado → naranja (`background: #ffe0b2; color: #e65100`)
  - No usar `mat-chip` con `color="accent"/"warn"` — usar `<span class="badge">` con CSS propio

## Navegación — ítems del sidebar

Para la aplicación Biblioteca, los ítems del sidebar son **exactamente**:
| Ícono | Ruta | Etiqueta |
|-------|------|----------|
| `auto_stories` (logo) | — | **Biblioteca** |
| `dashboard` | `/inicio` | Panel Principal |
| `people` | `/clientes` | Socios |
| `menu_book` | `/libros` | Libros |

**No existe ítem de "Préstamos" en el sidebar.** La gestión de préstamos se hace desde el panel de Libros mediante los botones de acción de cada fila.

## Acciones de libros — iconos de préstamo/devolución

En la tabla de libros, el botón de acción de préstamo debe ser **condicional según el estado del libro**:

```html
<button
  mat-icon-button
  [title]="row.estado === 1 ? 'Prestar' : 'Devolver'"
  [style.color]="row.estado === 1 ? '#4caf50' : '#e65100'"
  (click)="togglePrestamo(row)"
>
  <mat-icon
    >{{ row.estado === 1 ? 'bookmark_add' : 'bookmark_remove' }}</mat-icon
  >
</button>
```

- `bookmark_add` (verde oscuro, `#388e3c`) cuando el libro está **Disponible** (estado=1) → Prestar
- `bookmark_remove` (verde claro, `#4caf50`) cuando el libro está **Prestado** (estado=0) → Devolver
- El método `togglePrestamo()` abre `PrestarDialogComponent` para prestar, o confirma la devolución llamando `prestamosApi.devolver(libro.prestamo_id)`
- El JOIN de libros con préstamos debe incluir `p.id AS prestamo_id` además de `p.fecha_devolucion`

## Columnas de tablas — completitud obligatoria

- Incluir **todas las columnas relevantes** del modelo, incluyendo las que vienen de JOINs del backend
- Si un modelo tiene `fecha_devolucion` (de JOIN con prestamos), la tabla DEBE mostrar esa columna como "Dev. Prevista"
- Incluir filtros para todos los campos enumerados (estado, categoría, etc.) mediante `mat-select`
- El subtítulo bajo el `<h1>` debe mostrar el total de registros: `{{ items().length }} registros`

## Configuración Zoneless obligatoria

> **Angular 21+**: `provideExperimentalZonelessChangeDetection()` fue **eliminada**. Usar `provideZonelessChangeDetection()`.

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // ← SIEMPRE (NO la versión Experimental)
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
  ],
};
```

> **`@angular/animations`** NO se instala automáticamente con Angular Material. Siempre ejecutar:
>
> ```bash
> npm install @angular/animations@21
> ```

// Cada componente
@Component({
standalone: true,
changeDetection: ChangeDetectionStrategy.OnPush, // ← SIEMPRE
imports: [MatTableModule, ReactiveFormsModule, ...],
})
export class ClientesComponent {
items = signal<Cliente[]>([]); // ✅ signal
loading = signal(false); // ✅ signal
// nombre: string = ''; // ❌ PROHIBIDO
}

````

## `tsconfig.app.json` — `rootDir` OBLIGATORIO

Siempre incluir `"rootDir": "./src"` en `tsconfig.app.json`. Sin esto Angular CLI emite el error _"The common source directory is './src'. The 'rootDir' setting must be explicitly set"_:

```json
// ✅ CORRECTO
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "rootDir": "./src",
    "types": []
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.spec.ts"]
}
```

> ❌ Omitir `"rootDir": "./src"` → error inmediato en `ng build` / `ng serve`

## Patrones prohibidos

| ❌ Prohibido                                        | ✅ Alternativa                           |
| --------------------------------------------------- | ---------------------------------------- |
| `import 'zone.js'`                                  | `provideZonelessChangeDetection()`       |
| `provideExperimentalZonelessChangeDetection()`      | `provideZonelessChangeDetection()`       |
| `implements OnInit`                                 | Constructor + `effect()`                 |
| `ChangeDetectionStrategy.Default`                   | `ChangeDetectionStrategy.OnPush`         |
| `@NgModule`                                         | `standalone: true`                       |
| `setTimeout` para sincronizar                       | `signal.set()` + `effect()`             |
| Variables planas para estado                        | `signal()`                               |
| `{titulo}` como argumento de `HttpParams`           | `const p: Record<string,string> = {}`   |

## Formularios en dialogs — label del primer campo cortado

`mat-dialog-content` tiene `overflow: hidden` por defecto en Angular Material M3, lo que recorta el label flotante del primer `mat-form-field` cuando tiene foco. **Siempre** añadir `padding-top: 8px` al contenedor del formulario dentro del dialog:

```css
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px; /* ← OBLIGATORIO: evita que el label flotante quede cortado */
}
````

## Mapa VB6 → Angular

| VB6                                  | Angular                                       |
| ------------------------------------ | --------------------------------------------- |
| Form MDIChild con grid + botones ABM | List Component + Dialog Component (MatDialog) |
| `cmdnue` → nuevo registro            | Dialog en modo Create                         |
| `cmdmod` → modificar                 | Dialog en modo Edit                           |
| `cmdbor` → borrar                    | Confirm dialog + delete service call          |
| `cmdbus` → buscar                    | Input de búsqueda + signal filtrado           |
| `MSFlexGrid`                         | `MatTable` con `MatPaginator`                 |
| Form MDI principal con menús         | `AppShell` con `MatSidenav` + `MatToolbar`    |
| `MsgBox "mensaje"`                   | `MatSnackBar` o `MatDialog`                   |

## Estructura de archivos

```
apps/frontend/src/app/
├── components/
│   ├── clientes/
│   │   ├── clientes.component.ts
│   │   └── cliente-dialog.component.ts
│   ├── libros/
│   │   ├── libros.component.ts
│   │   └── libro-dialog.component.ts
│   └── ...
├── services/
│   ├── clientes.service.ts
│   └── ...
├── models/
│   └── *.model.ts   ← Interfaces que coinciden con swagger.json
└── app.config.ts    ← provideZonelessChangeDetection()
```
