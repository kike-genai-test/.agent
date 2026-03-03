# VB6 Dependencies Matrix — Biblioteca

> Generado por el agente `vb6-analyst`

## Dependencias entre formularios y módulos

```
MDIForm1.frm (Parent)
├── Module1.bas ←────── todos los formularios dependen de ini()/fin()/mancmd()/limpia()/sinum()
├── FORM7.FRM (Login modal)
│   └── tabla: clave
├── FRMCLI.FRM (MDIChild)
│   └── tabla: cliente
├── FRMLIB.FRM (MDIChild)
│   ├── tabla: libros
│   ├── tabla: cliente (JOIN para ver datos del socio)
│   └── FrmPres.FRM (abre al presionar "PRESTAR")
│       ├── tabla: cliente
│       └── tabla: libros
└── frmAYUDA.FRM (abre desde FRMCLI, FRMLIB, MDIForm1)
    └── biblio.htm (archivo estático de ayuda)
```

---

## Matriz detallada de dependencias

| Formulario | Depende de | Tipo de dependencia |
|------------|------------|---------------------|
| FORM7 | Module1.bas | ini(), fin() — conexión BD |
| FORM7 | tabla `clave` | SELECT — validación password |
| FRMCLI | Module1.bas | ini(), fin(), mancmd(), limpia(), sinum() |
| FRMCLI | tabla `cliente` | SELECT, INSERT, UPDATE |
| FRMCLI | frmAYUDA | Show — apertura formulario ayuda |
| FRMLIB | Module1.bas | ini(), fin(), mancmd(), limpia() |
| FRMLIB | tabla `libros` | SELECT, INSERT, UPDATE |
| FRMLIB | tabla `cliente` | SELECT (JOIN para datos del socio) |
| FRMLIB | FrmPres | txtidL = txtid; txttit = txtnom; Show |
| FRMLIB | frmAYUDA | Show |
| FrmPres | Module1.bas | ini(), fin() |
| FrmPres | tabla `cliente` | SELECT — validación socio |
| FrmPres | tabla `libros` | SELECT (pendientes), UPDATE (préstamo) |
| MDIForm1 | FORM7 | Form_Load — abre login al inicio |
| MDIForm1 | FRMCLI | socios_Click |
| MDIForm1 | FRMLIB | libros_Click |
| MDIForm1 | frmAYUDA | ayuda_Click |
| frmAYUDA | biblio.htm | WebBrowser navigation |
| Form1 | — | Ninguna (formulario vacío / muerto) |
| Form2 | — | Solo OLE1 no funcional (muerto) |

---

## Dependencias externas (librerías VB6)

| Librería | Uso | Migración Angular |
|---------|-----|-------------------|
| ADODB.Connection | Conexión a MS Access | better-sqlite3 (backend) |
| ADODB.Recordset | Lectura/escritura de datos | HttpClient (frontend) |
| MSFlexGrid (grilla) | Listado tabular de datos | Angular Material `mat-table` |
| WebBrowser1 | Vista de ayuda HTML | Componente `RouterLink` + página de ayuda |

---

## Grafo de llamadas entre formularios

| Origen | Evento | Destino | Tipo |
|--------|--------|---------|------|
| MDIForm1 | Form_Load | FORM7.Show | Abrir modal |
| MDIForm1 | socios_Click | FRMCLI.Show | Abrir MDIChild |
| MDIForm1 | libros_Click | FRMLIB.Show | Abrir MDIChild |
| MDIForm1 | ayuda_Click | frmAYUDA.Show | Abrir ventana |
| FORM7 | cmdace_Click | MDIForm1 (menus) | Habilitar/deshabilitar |
| FRMLIB | cmdpres_Click | FrmPres.Show + Unload Me | Navegar |
| FRMCLI | Command4_Click | frmAYUDA.Show | Abrir |
| FRMLIB | Command6_Click | frmAYUDA.Show | Abrir |
| FrmPres | Command4_Click | frmAYUDA.Show | Abrir |
