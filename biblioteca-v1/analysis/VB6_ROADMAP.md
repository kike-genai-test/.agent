# VB6 Migration Roadmap — Biblioteca

> Generado por el agente `vb6-analyst`

## Orden de migración recomendado

El orden prioriza: (1) desbloquear dependencias críticas, (2) valor de negocio inmediato, (3) complejidad.

---

## Sprint 1 — Fundamentos (Días 1-3)

### 1.1 Base de datos SQLite
**Origen:** `biblioteca.mdb` (3 tablas)  
**Destino:** `biblioteca-v1/modern-app/apps/backend/db/schema.sql`  
**Justificación:** Todo lo demás depende de la BD  
**Tareas:**
- [ ] Crear `schema.sql` con tablas `usuarios`, `socios`, `libros`
- [ ] Crear `seed.sql` con datos de prueba (5 socios, 10 libros, 2 préstamos)
- [ ] Crear `database.ts` singleton
- [ ] Verificar con `sqlite3 database.db ".schema"`

### 1.2 Backend — Autenticación  
**Origen:** `FORM7.FRM` + tabla `clave`  
**Destino:** `POST /auth/login` + middleware JWT  
**Justificación:** Todos los endpoints requieren autenticación  
**Tareas:**
- [ ] `auth.controller.ts` + `auth.service.ts`
- [ ] `auth.middleware.ts` (JWT verify)
- [ ] Seed: usuario admin con password hasheada (bcrypt)

---

## Sprint 2 — Core CRUD (Días 4-7)

### 2.1 Backend — API Socios  
**Origen:** `FRMCLI.FRM`  
**Destino:** `GET/POST/PUT/DELETE /socios`  
**Justificación:** Datos maestros de socios necesarios para préstamos  
**Endpoints:**
```
GET    /socios           → lista (filtro apellido, estado activo)
GET    /socios/:id       → detalle
POST   /socios           → crear
PUT    /socios/:id       → modificar
DELETE /socios/:id       → baja lógica (activo = 0)
GET    /socios/:id/prestamos → préstamos activos del socio
```

### 2.2 Backend — API Libros  
**Origen:** `FRMLIB.FRM`  
**Destino:** `GET/POST/PUT/DELETE /libros` + `/libros/:id/devolver`  
**Endpoints:**
```
GET    /libros              → lista (filtro titulo, autor, estado)
GET    /libros/:id          → detalle
POST   /libros              → crear
PUT    /libros/:id          → modificar
DELETE /libros/:id          → baja lógica
PATCH  /libros/:id/devolver → cambiar estado a disponible
```

### 2.3 Backend — API Préstamos  
**Origen:** `FrmPres.FRM`  
**Destino:** `POST /prestamos`  
**Endpoints:**
```
POST   /prestamos           → registrar préstamo (actualiza libro)
GET    /prestamos           → historial
```

---

## Sprint 3 — Frontend Angular (Días 8-14)

### 3.1 Estructura base
**Componentes:**
- [ ] `AppComponent` — Bootstrap zona-less + router
- [ ] `AppShellComponent` — Sidebar mat-sidenav (oscuro, estilo VB6)
- [ ] `AuthGuard` — `canActivate` con signals
- [ ] Interceptor HTTP — agrega Bearer token

### 3.2 Login
**Origen:** `FORM7.FRM`  
- [ ] `LoginComponent` — formulario reactivo + MatFormField
- [ ] `AuthService` — POST /auth/login; guarda JWT en localStorage

### 3.3 Socios  
**Origen:** `FRMCLI.FRM`  
- [ ] `ListaSociosComponent` — mat-table + filtros + paginación
- [ ] `FormSocioComponent` — modal mat-dialog para crear/editar
- [ ] `SociosService` — CRUD via HttpClient

### 3.4 Libros  
**Origen:** `FRMLIB.FRM`  
- [ ] `ListaLibrosComponent` — mat-table + filtro estado/texto
- [ ] `FormLibroComponent` — modal para CRUD
- [ ] `LibrosService` — CRUD + devolver via HttpClient
- [ ] Badges estado: verde=disponible, naranja=prestado

### 3.5 Préstamo  
**Origen:** `FrmPres.FRM`  
- [ ] `PrestamoDialogComponent` — mat-dialog con validación socio
- [ ] Integra con `PrestamosService`

### 3.6 Ayuda  
**Origen:** `frmAYUDA.FRM` + `biblio.htm`  
- [ ] `AyudaComponent` — página estática con contenido de biblio.htm

---

## Sprint 4 — Testing y Calidad (Días 15-18)

### 4.1 Tests unitarios backend (Jest)
- [ ] `auth.service.spec.ts`
- [ ] `socios.service.spec.ts`
- [ ] `libros.service.spec.ts`
- [ ] Cobertura objetivo: ≥80% líneas

### 4.2 Tests unitarios frontend (Jest)
- [ ] `login.component.spec.ts`
- [ ] `lista-socios.component.spec.ts`
- [ ] `lista-libros.component.spec.ts`

### 4.3 Tests E2E (Playwright)
- [ ] Flujo login exitoso/fallido
- [ ] Flujo CRUD socios
- [ ] Flujo préstamo + devolución

---

## Dependencias del roadmap

```
schema.sql ──→ seed.sql ──→ database.ts
                              │
                      ┌───────┴──────┐
                      ↓              ↓
              auth API          socios API
                 │                  │
                 └──────────────────┤
                                    ↓
                              libros API
                                    │
                              prestamos API
                                    │
                        ┌───────────┴──────────┐
                        ↓                      ↓
                 Angular Shell          Angular CRUD
                        │                      │
                        └──────────────────────┤
                                               ↓
                                            Tests
```

---

## Elementos NO migrar

| Elemento | Razón |
|---------|-------|
| `Form1.FRM` | Formulario vacío, 0 lógica útil |
| `Form2.FRM` | Solo contiene OLE1 no funcional |
| 27 funciones muertas | Detectadas por dead_code_detector |
| Conexión ADODB Jet 4.0 | Reemplazada totalmente por SQLite |
| WebBrowser1 control | Reemplazado por componente Angular routing |
| MsgBox | Reemplazado por MatSnackBar/MatDialog |
| `sinum()` | Reemplazado por Validators de Angular |
