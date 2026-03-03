# VB6 Migration Risks — Biblioteca

> Generado por el agente `vb6-analyst`

## Resumen de riesgos

| Severidad | Cantidad |
|-----------|----------|
| 🔴 Crítico | 2 |
| 🟠 Alto | 5 |
| 🟡 Medio | 4 |
| 🟢 Bajo | 3 |

---

## Riesgos críticos

### RISK-01 — Password en texto plano en BD
**Severidad:** 🔴 Crítico  
**Archivo:** `FORM7.FRM`, tabla `clave`  
**Descripción:** La contraseña de acceso se almacena en texto plano en la tabla `clave`. No hay salting ni hashing.  
**Impacto:** Vulnerabilidad de seguridad mayor; exposición de credenciales.  
**Mitigación Angular:** Implementar bcrypt hash en backend; JWT para sesiones; tabla de usuarios con roles.

### RISK-02 — SQL Injection en todas las queries
**Severidad:** 🔴 Crítico  
**Archivos:** `FRMCLI.FRM`, `FRMLIB.FRM`, `FrmPres.FRM`  
**Descripción:** Todas las queries están construidas con concatenación de strings sin sanitización:
```vb
rsc1.Open "Select * From Cliente Where Activo = 'Si' And Apellidos like '" & txtbape & "%'"
```
**Impacto:** Cualquier dato de entrada puede inyectar SQL arbitrario.  
**Mitigación Angular:** Usar parámetros preparados (`?`) en better-sqlite3 para TODAS las queries.

---

## Riesgos altos

### RISK-03 — Sin claves primarias definidas en MS Access
**Severidad:** 🟠 Alto  
**Tablas:** `clave`, `cliente`, `libros`  
**Descripción:** Ninguna tabla tiene PK definida en la BD Access. La integridad referencial depende del código.  
**Impacto:** Duplicados y registros huérfanos posibles.  
**Mitigación:** Definir `INTEGER PRIMARY KEY AUTOINCREMENT` en el schema SQLite.

### RISK-04 — Sin restricciones de FK en Access
**Severidad:** 🟠 Alto  
**Relación:** `libros.Socio` → `cliente.IdCliente`  
**Descripción:** La relación existe en el código pero no en la BD. No hay `FOREIGN KEY` definida.  
**Impacto:** Registros de libros con `Socio` que no existe en `cliente`.  
**Mitigación:** Activar `PRAGMA foreign_keys = ON` en SQLite; definir FK con `ON DELETE SET NULL`.

### RISK-05 — Conexión y Recordset globales
**Severidad:** 🟠 Alto  
**Archivo:** `Module1.bas`  
**Descripción:** `cn` y `rsc1` son variables globales compartidas entre todos los formularios. Patrón de diseño potencialmente peligroso (concurrencia, estado compartido).  
**Mitigación Angular:** Backend stateless con conexión por request en Node.js.

### RISK-06 — Formatos de fecha incompatibles
**Severidad:** 🟠 Alto  
**Archivos:** `FRMLIB.FRM`, `FrmPres.FRM`  
**Descripción:** Las fechas se guardan con syntax Access `#dd/mm/yyyy#` y se muestran con `Format(Now, "dd/mm/yyyy")`. Formato locale-dependiente.  
**Mitigación:** Normalizar a ISO 8601 `YYYY-MM-DD` en SQLite y Angular (ngx-mat-datepicker).

### RISK-07 — Código muerto 55%
**Severidad:** 🟠 Alto  
**Estadísticas:** 27/49 funciones muertas; 2 formularios huérfanos (Form1, Form2)  
**Descripción:** Más de la mitad del código es muerto o no utilizado.  
**Mitigación:** No migrar Form1, Form2 ni las 27 funciones muertas.

---

## Riesgos medios

### RISK-08 — WebBrowser como ayuda
**Severidad:** 🟡 Medio  
**Archivo:** `frmAYUDA.FRM`  
**Descripción:** La ayuda se implementa con un WebBrowser embebido apuntando a `biblio.htm`.  
**Mitigación Angular:** Convertir `biblio.htm` a una ruta Angular `/ayuda` con contenido estático.

### RISK-09 — Lógica mezclada con UI
**Severidad:** 🟡 Medio  
**Descripción:** Toda la lógica de negocio (validaciones, queries SQL) está en los event handlers de los formularios. No hay separación de capas.  
**Mitigación Angular:** Separar en Angular Services (frontend) y Express Services (backend).

### RISK-10 — Conteo de IDs manual
**Severidad:** 🟡 Medio  
**Descripción:** Los IDs se calculan manualmente (`RecordCount + 1`). Sin concurrencia pero frágil.  
**Mitigación:** `AUTOINCREMENT` en SQLite elimina este patrón.

### RISK-11 — MsgBox para feedback
**Severidad:** 🟡 Medio  
**Descripción:** Toda la retroalimentación al usuario es via `MsgBox` bloqueante.  
**Mitigación Angular:** `MatSnackBar` para mensajes no bloqueantes; `MatDialog` para confirmaciones.

---

## Riesgos bajos

### RISK-12 — sinum() para validación numérica
**Severidad:** 🟢 Bajo  
**Descripción:** Función en Module1 para filtrar teclas no numéricas. Redundante con HTML5 `type="number"`.  
**Mitigación Angular:** Validators de Angular Reactive Forms.

### RISK-13 — Caption "Biblioteca" con tildes inconsistentes
**Severidad:** 🟢 Bajo  
**Descripción:** Inconsistencias de acentuación en labels.  
**Mitigación:** Normalizar en Angular i18n.

### RISK-14 — Máximo 4+1 intentos de login
**Severidad:** 🟢 Bajo  
**Descripción:** Después de 5 intentos fallidos, ejecuta `End` (cierra la aplicación).  
**Mitigación Angular:** Rate limiting en backend; respuesta 429 después de N intentos.
