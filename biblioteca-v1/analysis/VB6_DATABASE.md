# VB6 Database Analysis — Biblioteca

> Generado por el agente `vb6-analyst`

## Base de datos original

| Propiedad | Valor |
|-----------|-------|
| Tipo | Microsoft Access (`.mdb`) |
| Engine | Microsoft Jet 4.0 OLE DB Provider |
| Archivo | `vb_sources/Biblioteca/Conexion/biblioteca.mdb` |
| Tablas detectadas | 3 |
| Relaciones | 0 (sin FK definidas en Access) |

---

## Tablas detectadas

### Tabla: `clave`

**Fuente:** `FORM7.FRM`

| Columna | Tipo VB6/Access | Tipo SQLite sugerido | Notas |
|---------|-----------------|---------------------|-------|
| `pass` | Text | `TEXT NOT NULL` | Contraseña de acceso |

**Operaciones:** READ  
**Nota:** Tabla de autenticación de un solo registro. En la migración se reemplaza por JWT + bcrypt.

---

### Tabla: `cliente` (socios)

**Fuentes:** `FRMCLI.FRM`, `FrmPres.FRM`, `FRMLIB.FRM`

| Columna | Tipo VB6/Access | Tipo SQLite sugerido | Notas |
|---------|-----------------|---------------------|-------|
| `IdCliente` | Long/AutoNumber | `INTEGER PRIMARY KEY AUTOINCREMENT` | PK |
| `Apellidos` | Text | `TEXT NOT NULL` | Búsqueda por LIKE |
| `Nombres` | Text | `TEXT NOT NULL` | — |
| `NºDoc` | Text | `TEXT` | Número de documento |
| `Domicilio` | Text | `TEXT` | — |
| `Telefono` | Text | `TEXT` | — |
| `Activo` | Text ('Si'/'No') | `INTEGER CHECK(activo IN (0,1)) DEFAULT 1` | Baja lógica |

**Operaciones:** SELECT, INSERT, UPDATE  
**Notas:**
- Baja lógica via `Activo = 'No'` (no DELETE real)
- JOIN con `Libros` en FrmPres para verificar préstamos pendientes

---

### Tabla: `libros`

**Fuentes:** `FRMLIB.FRM`, `FrmPres.FRM`

| Columna | Tipo VB6/Access | Tipo SQLite sugerido | Notas |
|---------|-----------------|---------------------|-------|
| `IdLibro` | Long/AutoNumber | `INTEGER PRIMARY KEY AUTOINCREMENT` | PK |
| `Titulo` | Text | `TEXT NOT NULL` | — |
| `Autor` | Text | `TEXT NOT NULL` | — |
| `Estado` | Text ('Si'/'No') | `TEXT CHECK(estado IN ('disponible','prestado')) DEFAULT 'disponible'` | disponible=Si, prestado=No |
| `Socio` | Long | `INTEGER` | FK → `cliente.id` (nullable) |
| `FecPres` | Date | `TEXT` (ISO 8601) | Fecha préstamo |
| `FecDev` | Date | `TEXT` (ISO 8601) | Fecha devolución |
| `dias` | Integer | `INTEGER DEFAULT 0` | Días de préstamo |
| `Activo` | Text ('Si'/'No') | `INTEGER CHECK(activo IN (0,1)) DEFAULT 1` | Baja lógica |

**Operaciones:** SELECT, INSERT, UPDATE  
**Notas:**
- `Estado = 'Si'` → disponible; `Estado = 'No'` → prestado
- `Socio` es FK a `cliente.id` pero sin restricción en Access original
- Baja lógica via `Activo = 'No'`

---

## Queries SQL extraídas del código VB6

### Module: FRMCLI

```sql
-- Read all clients with filter
SELECT * FROM Cliente WHERE Activo = 'Si' AND Apellidos LIKE '<param>%'
SELECT * FROM Cliente WHERE Activo = 'Si' AND IdCliente = <param>

-- Insert new client
INSERT INTO Cliente VALUES(<id>, '<apellidos>', '<nombres>', '<nrodoc>', '<domicilio>', '<telefono>', 'Si')

-- Update client
UPDATE Cliente SET Apellidos='<val>', Nombres='<val>', NºDoc='<val>', Domicilio='<val>', Telefono='<val>' WHERE IdCliente=<id>

-- Soft delete
-- (via Recordset update) rsc1!Activo = 'No'
```

### Module: FRMLIB

```sql
-- Read books with filters
SELECT * FROM Libros WHERE Activo = 'Si' AND Titulo LIKE '<param>%'
SELECT * FROM Libros WHERE Activo = 'Si' AND Autor LIKE '<param>%'
SELECT * FROM Libros WHERE Activo = 'Si' AND IdLibro = <param>

-- Get client data for loan display
SELECT Apellidos, Nombres, Domicilio, Telefono FROM Cliente WHERE IdCliente = <id>

-- Insert new book
INSERT INTO Libros VALUES(<id>, '<titulo>', '<autor>', '<estado>', <socio>, #<fecpres>#, #<fecdev>#, <dias>, 'Si')

-- Update book
UPDATE Libros SET Titulo='<val>', Autor='<val>', Estado='<val>', Socio=<val>, FecPres=#<val>#, FecDev=#<val>#, dias=<val> WHERE IdLibro=<id>

-- Return book
UPDATE Libros SET Estado='Si' WHERE IdLibro=<id>
```

### Module: FrmPres

```sql
-- Validate client
SELECT Cliente.* FROM Cliente WHERE Cliente.IdCliente=<id> AND Cliente.Apellidos='<apellidos>'

-- Check pending loans (JOIN)
SELECT Cliente.*, Libros.*
FROM Cliente, Libros
WHERE Cliente.IdCliente = Libros.Socio
  AND Cliente.IdCliente = <id>
  AND Cliente.Apellidos = '<apellidos>'
  AND Libros.Estado = 'No'

-- Register loan
UPDATE Libros SET Estado='No', Socio=<id_socio>, FecPres=#<fecha_hoy>#, FecDev=#<fecha_dev>#, dias=<dias> WHERE IdLibro=<id>
```

### Module: FORM7

```sql
-- Read password
SELECT pass FROM clave
```

---

## Relaciones (inferidas del código)

| Tabla hija | Columna | Tabla padre | Columna | Tipo |
|-----------|---------|-------------|---------|------|
| `libros` | `Socio` | `cliente` | `IdCliente` | FK opcional (NULL = sin préstamo) |

---

## Consideraciones de migración

| Issue | Severidad | Acción |
|-------|-----------|--------|
| Sin PKs en Access | Alta | Añadir `AUTOINCREMENT` en SQLite |
| Sin FKs en Access | Alta | Definir `FOREIGN KEY` en SQLite con `ON DELETE SET NULL` |
| Fechas en formato `dd/mm/yyyy` con `#` | Media | Convertir a ISO 8601 `YYYY-MM-DD` |
| `Estado` como 'Si'/'No' | Baja | Normalizar a `'disponible'/'prestado'` |
| `Activo` como 'Si'/'No' | Baja | Normalizar a `INTEGER 0/1` |
| Connection string hardcodeada con Jet 4.0 | Alta | Reemplazar con `better-sqlite3` |
| Tabla `clave` con password en texto plano | Crítica | Reemplazar con JWT + bcrypt hash |
