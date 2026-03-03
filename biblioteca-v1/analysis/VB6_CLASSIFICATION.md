# VB6 Classification — Biblioteca

> Generado por el agente `vb6-analyst`  
> Priorización de elementos para migración Angular

## Formularios — Clasificación y Prioridad

| Formulario | Tipo Angular | Prioridad | Ruta Angular | Notas |
|-----------|-------------|----------|--------------|-------|
| `FORM7.FRM` | LoginComponent (standalone) | P1 — Alta | `/login` | Bloqueador de todo el acceso |
| `MDIForm1.FRM` | AppShellComponent (layout) | P1 — Alta | `app-shell` (layout) | Sidebar/Navbar principal |
| `FRMCLI.FRM` | SociosComponent (lista+CRUD) | P2 — Alta | `/socios` | Lista + formulario modal |
| `FRMLIB.FRM` | LibrosComponent (lista+CRUD) | P2 — Alta | `/libros` | Lista + formulario modal |
| `FrmPres.FRM` | PrestamosComponent (modal) | P3 — Media | `/libros/prestamo/:id` | Modal de préstamo |
| `frmAYUDA.FRM` | AyudaComponent | P4 — Baja | `/ayuda` | Página estática |
| `Form1.FRM` | — | P5 — No migrar | — | Código muerto |
| `Form2.FRM` | — | P5 — No migrar | — | Código muerto |

---

## Módulos — Clasificación

| Módulo VB6 | Angular/Node equivalente | Descripción |
|-----------|-------------------------|-------------|
| `Module1.bas` → `ini()/fin()` | `DatabaseModule` (backend singleton) | Conexión BD |
| `Module1.bas` → `mancmd()` | `ReactiveFormsModule` + validators | Control estado botones |
| `Module1.bas` → `limpia()` | `form.reset()` | Reseteo de formularios |
| `Module1.bas` → `sinum()` | `Validators.pattern(/^[0-9]+$/)` | Validación numérica |

---

## Lógica de negocio — Clasificación

| Lógica VB6 | Capa Angular | Capa Backend | Descripción |
|-----------|-------------|-------------|-------------|
| Validación login | AuthService (frontend) | AuthController (backend) | POST /auth/login → JWT |
| CRUD Clientes | SociosService | SociosController | GET/POST/PUT /socios |
| CRUD Libros | LibrosService | LibrosController | GET/POST/PUT /libros |
| Registro préstamo | PrestamosService | PrestamosController | POST /prestamos |
| Devolución | LibrosService | LibrosController | PATCH /libros/:id/devolver |
| Consulta préstamos pendientes | SociosService | SociosController | GET /socios/:id/prestamos |

---

## Servicios Angular planificados

| Servicio | Métodos | Consume |
|---------|---------|---------|
| `AuthService` | `login()`, `logout()`, `isAuthenticated()`, `getToken()` | POST /auth/login |
| `SociosService` | `getAll()`, `getById()`, `create()`, `update()`, `delete()`, `search()` | /socios |
| `LibrosService` | `getAll()`, `getById()`, `create()`, `update()`, `delete()`, `search()`, `devolver()` | /libros |
| `PrestamosService` | `create()`, `getPendientesBySocio()` | /prestamos |

---

## Signals planificadas por componente

| Componente | Signal | Tipo |
|-----------|--------|------|
| `ListaSociosComponent` | `socios` | `signal<Socio[]>([])` |
| `ListaSociosComponent` | `loading` | `signal<boolean>(false)` |
| `ListaSociosComponent` | `filtro` | `signal<string>('')` |
| `ListaLibrosComponent` | `libros` | `signal<Libro[]>([])` |
| `ListaLibrosComponent` | `loading` | `signal<boolean>(false)` |
| `ListaLibrosComponent` | `estadoFiltro` | `signal<string>('todos')` |
| `LoginComponent` | `loading` | `signal<boolean>(false)` |
| `LoginComponent` | `error` | `signal<string | null>(null)` |
