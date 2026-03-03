# VB6 Inventory — Biblioteca

> Generado automáticamente por el agente `vb6-analyst` a partir de `inventory.json`

## Resumen general

| Métrica | Valor |
|---------|-------|
| Total archivos | 124 |
| Formularios (`.frm`) | 8 |
| Módulos (`.bas`) | 1 |
| Clases (`.cls`) | 0 |
| Total controles | 111 |
| Total funciones | 151 |
| Líneas de código | 2,116 |
| Complejidad media | 2.65 |
| Riesgo (0-100) | 56 |

---

## Formularios

### FORM7.FRM — Acceso al Programa (Login)

| Propiedad | Valor |
|-----------|-------|
| Caption | "Acceso al Programa" |
| Tipo | Formulario modal de login |
| LOC (estimado) | ~50 |

**Controles principales:**
- `txtlog` — TextBox: entrada de contraseña (PasswordChar="*")
- `cmdace` — CommandButton: "Aceptar"
- `cmdsal` — CommandButton: "Salir"

**Eventos:**
| Evento | Descripción |
|--------|-------------|
| `Form_Load` | Lee password desde tabla `clave` vía ADODB; guarda en `txtlog.Tag` |
| `cmdace_Click` | Valida `txtlog.Text == txtlog.Tag`; habilita menús en MDIForm1; máx 5 intentos |
| `cmdsal_Click` | `Unload Me` |

**Dependencias:** `Module1.bas` (`ini`, `fin`), tabla `clave`

---

### FRMCLI.FRM — Registro Clientes

| Propiedad | Valor |
|-----------|-------|
| Caption | "Registro Clientes" |
| Tipo | MDIChild — CRUD de socios |
| LOC (estimado) | ~220 |

**Controles principales:**
- `txtid` — Id del socio (autoincremental)
- `txtApe` — Apellidos
- `txtnom` — Nombres
- `txtDNI` — Nº Documento
- `txtdir` — Domicilio
- `txttel` — Teléfono
- `grilla` — MSFlexGrid (listado de socios)
- `FrameABM` — Frame con botones CRUD
- `Frame1` — Frame de búsqueda

**Eventos / Botones CRUD:**
| Botón/Evento | Descripción |
|-------------|-------------|
| `cmdnue_Click` | Nuevo socio; autoincrementa `txtid` |
| `cmdmod_Click` | Activa modo modificación (`modi=1`) |
| `cmdbor_Click` | Baja lógica: `Activo = 'No'` |
| `cmdreg_Click` | INSERT o UPDATE en tabla `Cliente` |
| `cmdcan_Click` | Cancela y limpia formulario |
| `cmdbus_Click` | Muestra panel de búsqueda |
| `Command1_Click` | Ejecuta búsqueda por apellido o idCliente |
| `Command2_Click` | Busca todos (`%`) |
| `Command3_Click` | Oculta búsqueda, muestra FrameABM |
| `Command4_Click` | Abre frmAYUDA |
| `grilla_Click` | Popula campos desde fila seleccionada |

**SQL extraído:**
```sql
SELECT * FROM Cliente WHERE Activo = 'Si' AND Apellidos LIKE '<param>%'
SELECT * FROM Cliente WHERE Activo = 'Si' AND IdCliente = <param>
UPDATE Cliente SET Apellidos=?, Nombres=?, NºDoc=?, Domicilio=?, Telefono=? WHERE IdCliente=?
INSERT INTO Cliente VALUES(?, ?, ?, ?, ?, ?, 'Si')
```

---

### FRMLIB.FRM — Registro Libros

| Propiedad | Valor |
|-----------|-------|
| Caption | "Registro Libros" |
| Tipo | MDIChild — CRUD de libros |
| LOC (estimado) | ~280 |

**Controles principales:**
- `txtid` — Id del libro
- `txtApe` — Título del libro
- `txtnom` — Autor del libro
- `txtesta` — Estado (Si=disponible, No=prestado)
- `txtIdSo` — Id del socio (cuando está prestado)
- `txtfecp` — Fecha de préstamo
- `txtfecd` — Fecha de devolución
- `txtdias` — Días de préstamo
- `grilla` — MSFlexGrid (listado de libros)
- `Frame2` — Visible cuando libro está prestado (devolver)

**Eventos / Botones CRUD:**
| Botón/Evento | Descripción |
|-------------|-------------|
| `cmdnue_Click` | Nuevo libro |
| `cmdmod_Click` | Modo modificación |
| `cmdbor_Click` | Baja lógica: `Activo='No'` |
| `cmdreg_Click` | INSERT o UPDATE en tabla `Libros` |
| `cmdcan_Click` | Cancela y limpia |
| `cmdbus_Click` | Panel de búsqueda |
| `cmdpres_Click` | Abre FrmPres con datos del libro |
| `Command1_Click` | Búsqueda por título, autor o idLibro |
| `Command2_Click` | Todos los registros |
| `Command4_Click` | Ver datos del socio (JOIN Cliente-Libros) |
| `Command5_Click` | Registrar devolución: `Estado='Si'` |

**SQL extraído:**
```sql
SELECT * FROM Libros WHERE Activo = 'Si' AND Titulo LIKE '<param>%'
SELECT * FROM Libros WHERE Activo = 'Si' AND Autor LIKE '<param>%'
SELECT * FROM Libros WHERE Activo = 'Si' AND IdLibro = <param>
UPDATE Libros SET Titulo=?, Autor=?, Estado=?, Socio=?, FecPres=?, FecDev=?, dias=? WHERE IdLibro=?
INSERT INTO Libros VALUES(?, ?, ?, ?, ?, ?, ?, ?, 'Si')
UPDATE Libros SET Estado='Si' WHERE IdLibro=?
```

---

### FrmPres.FRM — Préstamo de Libros

| Propiedad | Valor |
|-----------|-------|
| Caption | "PRESTAMO DE LIBROS" |
| Tipo | Formulario modal (abierto desde FRMLIB) |
| LOC (estimado) | ~120 |

**Controles principales:**
- `txtidL` — Id del libro (recibido desde FRMLIB)
- `txttit` — Título del libro (recibido desde FRMLIB)
- `txtsocio` — Id del socio
- `txtApe` — Apellido del socio
- `txtdias` — Días de préstamo
- `Grilla1` — MSFlexGrid (libros pendientes del socio)
- `cmdreg` — "Registrar Prestamo"
- `cmdcons` — "Consulta" (verifica si el socio tiene libros pendientes)

**Flujo de negocio:**
1. Usuario ingresa `txtsocio` y `txtApe`
2. `cmdcons_Click`: verifica cliente válido; muestra libros pendientes si existen
3. Si sin pendientes: habilita `cmdreg`
4. `cmdreg_Click`: calcula `FecDev = Now + dias`; `UPDATE Libros SET Estado='No'...`

**SQL extraído:**
```sql
SELECT Cliente.* FROM Cliente WHERE IdCliente=? AND Apellidos=?
SELECT Cliente.*, Libros.* FROM Cliente, Libros WHERE Cliente.IdCliente=Libros.Socio AND Cliente.IdCliente=? AND Apellidos=? AND Libros.Estado='No'
UPDATE Libros SET Estado='No', Socio=?, FecPres=?, FecDev=?, dias=? WHERE IdLibro=?
```

---

### MDIForm1.FRM — Ventana Principal MDI

| Propiedad | Valor |
|-----------|-------|
| Caption | "BIBLIOTECA" |
| Tipo | MDI Parent container |

**Menú:**
- Ingreso → Password → Cerrar Sesión
- Socios (habilitado tras login)
- Libros (habilitado tras login)
- Ayuda

**Eventos:**
| Evento | Descripción |
|--------|-------------|
| `Form_Load` | Abre FORM7 (login); deshabilita Socios y Libros |
| `Password_Click` | Muestra FORM7 |
| `CerrarSesion_Click` | Deshabilita Socios y Libros |
| `socios_Click` | Carga FRMCLI |
| `libros_Click` | Carga FRMLIB |
| `ayuda_Click` | Carga frmAYUDA |

---

### frmAYUDA.FRM — Ayuda

| Propiedad | Valor |
|-----------|-------|
| Caption | "BIBLIOTECA — Ayuda —" |
| Tipo | Vista de ayuda (WebBrowser) |

**Eventos:**
| Evento | Descripción |
|--------|-------------|
| `Form_Load` | `WebBrowser1.Navigate App.Path & "\biblio.htm"` |

---

### Form1.FRM / Form2.FRM

Formularios vacíos/no utilizados. Candidatos a código muerto.

---

## Módulos

### Module1.BAS — Módulo Global

**Variables globales:**
```vb
Public cn As ADODB.Connection   ' Conexión global a la BD
Public rsc1 As ADODB.Recordset  ' Recordset global
```

**Funciones públicas:**
| Función | Descripción |
|---------|-------------|
| `ini()` | Abre conexión ADODB a `biblioteca.mdb` via Jet 4.0 |
| `fin()` | Cierra `rsc1` y `cn` |
| `mancmd(frm, modo)` | Habilita/deshabilita botones CRUD según modo (ini/can/nue/mod/reg/bus/bor) |
| `limpia(frm)` | Limpia todos los TextBox de un formulario |
| `sinum(ascii)` | Filtra teclado solo números |

**Connection string:**
```
Provider=Microsoft.Jet.OLEDB.4.0;Data Source=<path>\Conexion\biblioteca.mdb
```
