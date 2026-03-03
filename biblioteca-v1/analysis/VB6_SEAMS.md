# VB6 Seams (Puntos de Extensión) — Biblioteca

> Generado por el agente `vb6-analyst`  
> Puntos de extensión para el patrón Strangler Fig

## ¿Qué es un Seam?

Un "seam" (costura) es un punto en el código legacy donde se puede **interceptar el comportamiento** para redirigir gradualmente hacia el nuevo sistema, sin modificar el código existente.

---

## Seam 1 — Conexión a la base de datos

**Archivo:** `Module1.bas`, función `ini()`  
**Tipo:** Seam de infraestructura (Data Store)  
**Punto de corte:**
```vb
' VB6 — ANTES
Public Sub ini()
  cn.Open "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" & App.Path & "\Conexion\biblioteca.mdb"
End Sub
```
**Reemplazo Angular/Node:**
```typescript
// DESPUÉS — backend/db/database.ts
import Database from 'better-sqlite3';
const db = new Database('db/database.db');
db.pragma('foreign_keys = ON');
export default db;
```
**Estrategia:** Reemplazar totalmente — sin compatibilidad hacia atrás necesaria.

---

## Seam 2 — Validación de autenticación

**Archivo:** `FORM7.FRM`, `cmdace_Click`  
**Tipo:** Seam de autenticación  
**Punto de corte:**
```vb
' VB6 — ANTES: password en Tag vs texto plano en BD
If txtlog.Tag = txtlog.Text Then
  MDIForm1.socios.Enabled = True
```
**Reemplazo Angular/Node:**
```typescript
// DESPUÉS — backend: JWT + bcrypt
// POST /auth/login → { token: string }
// Frontend: AuthGuard con CanActivate signal-based
const isAuthenticated = computed(() => !!this.authService.getToken());
```
**Estrategia:** Reemplazar totalmente con JWT.

---

## Seam 3 — CRUD de Clientes (ABM)

**Archivo:** `FRMCLI.FRM`, botones `cmdnue/cmdmod/cmdbor/cmdreg`  
**Tipo:** Seam de operaciones CRUD  
**Punto de corte:**
```vb
' VB6 — ANTES: SQL directo en event handlers
cn.Execute "Insert Into Cliente Values(..."
cn.Execute "Update Cliente Set Apellidos=..."
```
**Reemplazo Angular/Node:**
```typescript
// DESPUÉS — Angular: SociosService.create() / update()
// Backend: POST /socios, PUT /socios/:id
```
**Estrategia:** Extraer a service Angular + REST API backend.

---

## Seam 4 — CRUD de Libros (ABM)

**Archivo:** `FRMLIB.FRM`, botones `cmdnue/cmdmod/cmdbor/cmdreg`  
**Tipo:** Seam de operaciones CRUD (idéntico al de Clientes)  
**Punto de corte:** Mismo patrón que FRMCLI.  
**Reemplazo Angular/Node:** `LibrosService` + `GET/POST/PUT /libros`

---

## Seam 5 — Registro de préstamo

**Archivo:** `FrmPres.FRM`, `cmdreg_Click`  
**Tipo:** Seam de transacción de negocio  
**Punto de corte:**
```vb
' VB6 — una sola query UPDATE que cambia estado del libro
cn.Execute "Update Libros Set Estado='No', Socio=..., FecPres=..., FecDev=..., dias=... Where IdLibro=..."
```
**Reemplazo Angular/Node:**
```typescript
// DESPUÉS — transacción atómica en backend
// POST /prestamos → { libroId, socioId, dias }
// Internamente: UPDATE libros SET estado='prestado', ...
```
**Estrategia:** Convertir a endpoint REST atómico + validaciones.

---

## Seam 6 — Devolución de libro

**Archivo:** `FRMLIB.FRM`, `Command5_Click`  
**Tipo:** Seam de cambio de estado  
**Punto de corte:**
```vb
cn.Execute "Update Libros Set Estado='Si' Where IdLibro=" & txtid
```
**Reemplazo Angular/Node:**
```typescript
// DESPUÉS:
// PATCH /libros/:id/devolver
// { estado: 'disponible', socio: null, fecdev: null }
```

---

## Mapa de Strangler Fig

```
VB6 Biblioteca (Legacy)                Angular + Node.js (Nuevo)
─────────────────────────────────────────────────────────────────
FORM7 (Login)          ←──── reemplaza ────→ /login (LoginComponent)
MDIForm1 (MDI shell)   ←──── reemplaza ────→ AppShell (mat-sidenav)
FRMCLI (Socios)        ←──── reemplaza ────→ /socios + API /socios
FRMLIB (Libros)        ←──── reemplaza ────→ /libros + API /libros
FrmPres (Préstamo)     ←──── reemplaza ────→ /libros/prestamo + API /prestamos
frmAYUDA (Ayuda)       ←──── reemplaza ────→ /ayuda (página estática)
Module1.bas (Utils)    ←──── distribuido ──→ AuthGuard + Validators + DB singleton
```
