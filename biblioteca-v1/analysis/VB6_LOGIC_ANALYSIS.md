# VB6 Logic Analysis

Generated from: `biblioteca-v1/analysis/inventory.json`

> [!NOTE]
> This document contains the extracted logic (code) from forms, modules, and classes.
> Use this to implement business rules, validations, and workflows in the new system.

## Forms Logic

### Form: Form1

**Key Properties:**
| Property | Value |
|----------|-------|
| Caption | "Form1" |

### Form: Form2

**Key Properties:**
| Property | Value |
|----------|-------|
| Caption | "BD" |
| Height | 1092 |
| Left | 240 |
| Top | 120 |
| Width | 1572 |

#### Events

**Form_Load**
```vb
'OLE1.Action = 1
```

### Form: FORM7

**Key Properties:**
| Property | Value |
|----------|-------|
| Caption | "Acceso al Programa" |
| Caption | "Salir" |
| Height | 375 |
| Left | 1680 |
| Top | 840 |
| Width | 1095 |
| Caption | "Aceptar" |
| Height | 375 |
| Left | 480 |
| Top | 840 |
| Width | 975 |
| Height | 405 |
| Left | 480 |
| Top | 240 |
| Width | 2295 |
| Caption | "Ingrese su ""LOGUIN""" |
| Height | 255 |
| Left | 480 |
| Top | 0 |
| Width | 2295 |

#### Events

**cmdace_Click**
```vb
If txtlog.Tag = txtlog.Text Then
MDIForm1.socios.Enabled = True
MDIForm1.libros.Enabled = True

MDIForm1.ayuda.Enabled = True

MsgBox "Contraseña aceptada", vbInformation, "ACCESO A BIBLIOTECA"

Unload Me
Else
MsgBox "Contraseña Rechazada", vbCritical, "ACCESO A BIBLIOTECA"
cont = cont + 1
txtlog = ""
MDIForm1.socios.Enabled = False
MDIForm1.libros.Enabled = False

MDIForm1.ayuda = True
If cont > 4 Then End
End If
fin
```

**cmdsal_Click**
```vb
Unload Me
```

**Form_Load**
```vb
ini
rsc1.Open "Select pass from clave", cn, adOpenStatic, adLockBatchOptimistic
If rsc1.Fields(0) <> "" Then txtlog.Tag = rsc1.Fields(0)
```

**txtlog_KeyPress**
```vb
If KeyAscii = 13 Then cmdace_Click
```

### Form: frmAYUDA

**Key Properties:**
| Property | Value |
|----------|-------|
| Caption | "BIBLIOTECA  - Ayuda -" |
| Height | 7455 |
| Left | 120 |
| Top | 120 |
| Width | 4335 |

#### Events

**Form_Load**
```vb
WebBrowser1.Navigate App.Path & "\biblio.htm"
```

### Form: FRMCLI

**Key Properties:**
| Property | Value |
|----------|-------|
| Caption | "Registro Clientes " |
| Caption | "?" |
| Height | 495 |
| Left | 7440 |
| Top | 0 |
| Width | 495 |
| Height | 615 |
| Left | 240 |
| Top | 3720 |
| Visible | 0   'False |
| Width | 7935 |
| Caption | "&Nuevo" |
| Height | 375 |
| Left | 0 |
| Top | 120 |
| Width | 1095 |
| Caption | "&Borrar" |
| Height | 375 |
| Left | 1200 |
| Top | 120 |
| Width | 975 |
| Caption | "&Cancelar" |
| Height | 375 |
| Left | 5160 |
| Top | 120 |
| Width | 1335 |
| Caption | "&Registrar" |
| Height | 375 |
| Left | 3720 |
| Top | 120 |
| Width | 1335 |
| Caption | "&Salir" |
| Height | 375 |
| Left | 6600 |
| Top | 120 |
| Width | 1335 |
| Caption | "&Modificar" |
| Height | 375 |
| Left | 2280 |
| Top | 120 |
| Width | 1335 |
| Caption | "Busqueda" |
| Height | 2655 |
| Left | 240 |
| Top | 4320 |
| Visible | 0   'False |
| Width | 7935 |
| Caption | "No Buscar" |
| Height | 255 |
| Left | 4680 |
| Top | 960 |
| Width | 1935 |
| Caption | "Todos los registros" |
| Height | 255 |
| Left | 4680 |
| Top | 600 |
| Width | 1935 |
| Height | 285 |
| Left | 600 |
| Top | 240 |
| Width | 855 |
| Height | 285 |
| Left | 1800 |
| Top | 240 |
| Width | 2655 |
| Caption | "Iniciar Consulta" |
| Height | 255 |
| Left | 4680 |
| Top | 240 |
| Width | 1935 |
| Height | 1335 |
| Left | 240 |
| Top | 1200 |
| Visible | 0   'False |
| Width | 7695 |
| Caption | "Por IdCliente" |
| Height | 255 |
| Left | 360 |
| Top | 600 |
| Width | 1095 |
| Caption | "Por letras ó Apellido Completo   Si ingresa  % verá todos los registros" |
| Height | 375 |
| Left | 1800 |
| Top | 600 |
| Width | 2655 |
| Caption | "&Buscar" |
| Height | 375 |
| Left | 2040 |
| Top | 600 |
| Width | 1095 |
| Height | 375 |
| Left | 5400 |
| Top | 2160 |
| Width | 1815 |
| Height | 375 |
| Left | 2760 |
| Top | 2160 |
| Width | 2415 |
| Height | 375 |
| Left | 360 |
| Top | 3120 |
| Width | 4815 |
| Height | 375 |
| Left | 360 |
| Top | 2160 |
| Width | 2055 |
| Height | 375 |
| Left | 5400 |
| Top | 3120 |
| Width | 2655 |
| Height | 375 |
| Left | 720 |
| Top | 600 |
| Width | 1095 |
| Caption | "Nº Documento del Socio" |
| Height | 195 |
| Left | 5400 |
| Top | 1680 |
| Width | 2100 |
| Caption | "Nombres del Socio" |
| Height | 195 |
| Left | 2880 |
| Top | 1680 |
| Width | 1605 |
| Caption | "Direccion del Socio" |
| Height | 195 |
| Left | 360 |
| Top | 2760 |
| Width | 1680 |
| Caption | " Teléfono del Socio" |
| Height | 195 |
| Left | 5400 |
| Top | 2760 |
| Width | 1680 |
| Caption | "Apellidos Socio" |
| Height | 195 |
| Left | 360 |
| Top | 1800 |
| Width | 1320 |
| Caption | "Id Socio" |
| Height | 195 |
| Left | 720 |
| Top | 360 |
| Width | 720 |

#### Events

**cmdbus_Click**
```vb
mancmd Me, "bus"
Frame1.Visible = True
txtbleg.Locked = False
txtbape.Locked = False
txtbleg.SetFocus
```

**cmdbor_Click**
```vb
ini
mancmd Me, "bor"
If rsc1.State = 1 Then rsc1.Close
If MsgBox("ESTA SEGURO DE DAR DE BAJA ESTE REGISTRO???", vbYesNo, "PRECAUCION!! Se dar  de baja un REGISTRO") = vbYes Then
rsc1.Open "Cliente", cn, adOpenStatic, adLockOptimistic
Do While rsc1.EOF = False
If rsc1!IdCliente = txtid Then
Exit Do
End If
rsc1.MoveNext
Loop
rsc1!Activo = "No"
rsc1.Update
rsc1.MoveLast
rsc1.Close
MsgBox "La Operación se ha efectuado satifactoriamente"
End If
cmdcan_Click
fin
```

**cmdcan_Click**
```vb
limpia Me
mancmd Me, "can"
fgrilla
Frame1.Visible = False
```

**cmdmod_Click**
```vb
mancmd Me, "mod"
modi = 1
```

**cmdnue_Click**
```vb
txtApe.SetFocus
mancmd Me, "nue"
modi = 0
ini
rsc1.Open "Select * from Cliente", cn, adOpenStatic, adLockOptimistic
txtid = rsc1.RecordCount + 1
rsc1.Close
IdCli = 1
fin
```

**cmdreg_Click**
```vb
ini
                                If rsc1.State = 1 Then rsc1.Close
'On Error GoTo xerror
mancmd Me, "reg"
If modi = 1 Then
cn.Execute "Update Cliente Set Apellidos = '" & txtApe & "', Nombres = '" & _
txtnom & "', NºDoc = '" & txtDNI & "', Domicilio = '" & txtdir & "', Telefono = '" & txttel & "' Where IdCliente = " & txtid



Else
rsc1.Open "Select IdCliente from Cliente order by IdCliente", cn, adOpenStatic, adLockOptimistic
If rsc1.RecordCount > 0 Then
rsc1.MoveLast
IdCli = rsc1!IdCliente + 1
Else
IdCli = 1
End If
                                If rsc1.State = 1 Then rsc1.Close
cn.Execute "Insert Into Cliente Values(" & IdCli & ", '" & txtApe & "', '" & txtnom & _
"', '" & txtDNI & "', '" & txtdir & "', '" & txttel & "', 'Si')"
End If
MsgBox "Operacion exitosa"
cmdcan_Click
FrameABM.Visible = False
fin
Exit Sub
xerror:
If Err.Number = -2147217900 Then
MsgBox "Tiene  que completar los datos faltantes"
fin
Exit Sub
End If
MsgBox " No se realizó operacion por: " & Err.Description & Err.Number
fin
```

**cmdsal_Click**
```vb
Unload Me
```

**Command2_Click**
```vb
txtbape = "%"
Command1_Click
```

**Command3_Click**
```vb
Frame1.Visible = False
FrameABM.Visible = True
cmdnue.Enabled = True
```

**Command4_Click**
```vb
frmAYUDA.Show
```

**Form_Activate**
```vb
Me.Top = 1
Me.Left = 1000
ini '//funcion que conecta a la base de datos
mancmd Me, "ini"
```

**grilla_Click**
```vb
With grilla
If .RowSel < 1 Then Exit Sub
txtid = .TextMatrix(.RowSel, 0)
txtApe = .TextMatrix(.RowSel, 1)
txtnom = .TextMatrix(.RowSel, 2)
txtDNI = .TextMatrix(.RowSel, 3)
txtdir = .TextMatrix(.RowSel, 4)
txttel = .TextMatrix(.RowSel, 5)
End With

cmdmod.Enabled = True
cmdbor.Enabled = True
cmdreg.Enabled = False
cmdnue.Enabled = False
FrameABM.Visible = True
Frame1.Visible = False
```

**Command1_Click**
```vb
'Busca por legajo o nombre
'//la linea siguiente hace una rutina saltando el error para
'//que no se clave el programa, activar una vez que este todo Ok

'On Error GoTo xerror
ini
fgrilla
If rsc1.State = 1 Then rsc1.Close
With grilla
If txtbleg = "" And txtbape <> "" Then
rsc1.Open "Select * From Cliente Where Activo = 'Si' And Apellidos like '" & txtbape & "%'", cn, adOpenStatic, adLockOptimistic
Do While rsc1.EOF = False
.AddItem rsc1.Fields(0) & vbTab & rsc1.Fields(1) & vbTab & rsc1.Fields(2) & vbTab & rsc1.Fields(3) & vbTab & rsc1.Fields(4) & vbTab & rsc1.Fields(5)
rsc1.MoveNext
Loop
If rsc1.RecordCount = 0 Then MsgBox "No se encontró registro que coincida con las caracteristicas pedidas", vbInformation, "NO HAY REGISTROS QUE MOSTRAR"
rsc1.Close
.Visible = True
ElseIf txtbleg <> "" And txtbape = "" Then
rsc1.Open "SELECT * From Cliente Where Activo = 'Si' And IdCliente = " & txtbleg.Text, cn, adOpenStatic, adLockOptimistic
Do While rsc1.EOF = False
.AddItem rsc1.Fields(0) & vbTab & rsc1.Fields(1) & vbTab & rsc1.Fields(2) & vbTab & rsc1.Fields(3) & vbTab & rsc1.Fields(4) & vbTab & rsc1.Fields(5)
rsc1.MoveNext
Loop
If rsc1.RecordCount = 0 Then MsgBox "No se encontró registro que coincida con las caracteristicas pedidas", vbInformation, "NO HAY REGISTROS QUE MOSTRAR"
rsc1.Close


.Visible = True

Else
MsgBox "INGRESE UN DATO PARA LA BUSQUEDA", vbExclamation, "FALTA O EXCESO DE DATOS INGRESADOS"
txtbleg.SetFocus
txtbleg = ""
txtbape = ""
End If

End With
fin
Exit Sub

xerror:
MsgBox "NO SE PUDO BUSCAR POR: " & Err.Description, vbCritical, "NO SE EFECTUO EL PROCEDIMIENTO"
fin
```

**TxtTel_Change**
```vb
If txtApe <> "" And txtdir <> "" Then
cmdreg.Enabled = True
Else
cmdreg.Enabled = False
End If
```

**txtdir_Change**
```vb
If txtdir <> "" And txtApe <> "" Then
cmdreg.Enabled = True
End If
```

**txtDNGA_KeyPress**
```vb
KeyAscii = sinum(KeyAscii)
```

**txttel_KeyPress**
```vb
If KeyAscii = 13 Then
SendKeys "{Tab}" '//permite que cambie de texto con el enter
KeyAscii = 0
End If
```

**Txtdni_Change**
```vb
If txtdir <> "" And txtApe <> "" Then
cmdreg.Enabled = True
End If
```

**Txtdni_KeyPress**
```vb
If KeyAscii = 13 Then
SendKeys "{Tab}" '//permite que cambie de texto con el enter
KeyAscii = 0
End If
KeyAscii = sinum(KeyAscii)
```

**TxtApe_KeyPress**
```vb
If KeyAscii = 13 Then
SendKeys "{Tab}" '//permite que cambie de texto con el enter
KeyAscii = 0
End If
```

**TxtDir_KeyPress**
```vb
If KeyAscii = 13 Then
SendKeys "{Tab}" '//permite que cambie de texto con el enter
KeyAscii = 0
End If
If txtdir <> "" And txtApe <> "" Then
cmdreg.Enabled = True
End If
```

**Txtnom_Change**
```vb
If txtApe <> "" And txtdir <> "" Then
cmdreg.Enabled = True
End If
```

**Txtnom_KeyPress**
```vb
If KeyAscii = 13 Then
SendKeys "{Tab}" '//permite que cambie de texto con el enter
KeyAscii = 0
End If
```

**txtbape_KeyPress**
```vb
If KeyAscii = 13 Then
Command1_Click
KeyAscii = 0
End If
```

**txtbleg_KeyPress**
```vb
If KeyAscii = 13 Then
txtbape.SetFocus
KeyAscii = 0
End If
```

#### Functions

**Function: fgrilla**
```vb
With grilla
.FormatString = "IdCliente|Apellido|Nombres|Nº Documento|Domicilio|Telefono"
.ColWidth(0) = 12
.ColWidth(1) = 1200
.ColWidth(2) = 2000
.ColWidth(3) = 1200
.ColWidth(4) = 2100
.ColWidth(5) = 1000
.Rows = 1
End With
```

### Form: FRMLIB

**Key Properties:**
| Property | Value |
|----------|-------|
| Caption | "Registro Libros " |
| Caption | "?" |
| Height | 495 |
| Left | 7680 |
| Top | 0 |
| Width | 495 |
| Caption | "PRESTAR" |
| Height | 375 |
| Left | 7200 |
| Top | 2040 |
| Visible | 0   'False |
| Width | 975 |
| Caption | "Ultimo Usuario" |
| Height | 975 |
| Left | 360 |
| Top | 2640 |
| Visible | 0   'False |
| Width | 7695 |
| Caption | "Devolver" |
| Height | 315 |
| Left | 6720 |
| Top | 240 |
| Width | 855 |
| Caption | "Ver" |
| Height | 315 |
| Left | 6720 |
| Top | 600 |
| Width | 855 |
| Height | 375 |
| Left | 5760 |
| Top | 480 |
| Width | 735 |
| Height | 375 |
| Left | 120 |
| Top | 480 |
| Width | 2295 |
| Height | 375 |
| Left | 2640 |
| Top | 480 |
| Width | 2295 |
| Height | 375 |
| Left | 5040 |
| Top | 480 |
| Width | 495 |
| Caption | "Id Socio " |
| Height | 195 |
| Left | 5760 |
| Top | 240 |
| Width | 780 |
| Caption | "Fecha de prestamo de libro" |
| Height | 195 |
| Left | 120 |
| Top | 240 |
| Width | 2445 |
| Caption | "Fecha de devolucion" |
| Height | 195 |
| Left | 2640 |
| Top | 240 |
| Width | 1800 |
| Caption | "Dias" |
| Height | 255 |
| Left | 5040 |
| Top | 240 |
| Width | 495 |
| Height | 375 |
| Left | 5640 |
| Top | 2040 |
| Width | 1335 |
| Height | 615 |
| Left | 240 |
| Top | 3720 |
| Visible | 0   'False |
| Width | 7935 |
| Caption | "&Nuevo" |
| Height | 375 |
| Left | 0 |
| Top | 120 |
| Width | 1095 |
| Caption | "&Borrar" |
| Height | 375 |
| Left | 1200 |
| Top | 120 |
| Width | 975 |
| Caption | "&Cancelar" |
| Height | 375 |
| Left | 5160 |
| Top | 120 |
| Width | 1335 |
| Caption | "&Registrar" |
| Height | 375 |
| Left | 3720 |
| Top | 120 |
| Width | 1335 |
| Caption | "&Salir" |
| Height | 375 |
| Left | 6600 |
| Top | 120 |
| Width | 1335 |
| Caption | "&Modificar" |
| Height | 375 |
| Left | 2280 |
| Top | 120 |
| Width | 1335 |
| Caption | "Busqueda" |
| Height | 3135 |
| Left | 240 |
| Top | 4440 |
| Visible | 0   'False |
| Width | 7935 |
| Height | 285 |
| Left | 3480 |
| Top | 240 |
| Width | 2055 |
| Caption | "No Buscar" |
| Height | 255 |
| Left | 5880 |
| Top | 960 |
| Width | 1935 |
| Caption | "Todos los registros" |
| Height | 255 |
| Left | 5880 |
| Top | 600 |
| Width | 1935 |
| Height | 285 |
| Left | 120 |
| Top | 240 |
| Width | 855 |
| Height | 285 |
| Left | 1200 |
| Top | 240 |
| Width | 2055 |
| Caption | "Iniciar Consulta" |
| Height | 255 |
| Left | 5880 |
| Top | 240 |
| Width | 1935 |
| Height | 1815 |
| Left | 240 |
| Top | 1200 |
| Visible | 0   'False |
| Width | 7695 |
| Caption | "Por letras ó Autor Completo" |
| Height | 255 |
| Left | 3480 |
| Top | 600 |
| Width | 2055 |
| Caption | "Por IdLibro" |
| Height | 255 |
| Left | 120 |
| Top | 600 |
| Width | 855 |
| Caption | "Por letras ó Titulo Completo" |
| Height | 255 |
| Left | 1200 |
| Top | 600 |
| Width | 2055 |
| Caption | "&Buscar" |
| Height | 375 |
| Left | 2040 |
| Top | 720 |
| Width | 1095 |
| Height | 375 |
| Left | 2880 |
| Top | 2040 |
| Width | 2415 |
| Height | 375 |
| Left | 360 |
| Top | 2040 |
| Width | 2295 |
| Height | 375 |
| Left | 360 |
| Top | 720 |
| Width | 1095 |
| Caption | "Esta Disponible" |
| Height | 195 |
| Left | 5640 |
| Top | 1800 |
| Width | 1335 |
| Caption | "Autor del Libro" |
| Height | 195 |
| Left | 2880 |
| Top | 1800 |
| Width | 1260 |
| Caption | "Titulo del Libro" |
| Height | 195 |
| Left | 360 |
| Top | 1800 |
| Width | 1290 |
| Caption | "Id Libro" |
| Height | 195 |
| Left | 360 |
| Top | 360 |
| Width | 1140 |

#### Events

**cmdbus_Click**
```vb
mancmd Me, "bus"
Frame1.Visible = True
txtbleg.Locked = False
txtbape.Locked = False
txtbleg.SetFocus
```

**cmdbor_Click**
```vb
mancmd Me, "bor"
ini
If rsc1.State = 1 Then rsc1.Close
If MsgBox("ESTA SEGURO DE DAR DE BAJA ESTE REGISTRO???", vbYesNo, "PRECAUCION!! Se dar  de baja un REGISTRO") = vbYes Then
rsc1.Open "Libros", cn, adOpenStatic, adLockOptimistic
Do While rsc1.EOF = False
If rsc1!IdLibro = txtid Then
Exit Do
End If
rsc1.MoveNext
Loop
rsc1!Activo = "No"
rsc1.Update
rsc1.MoveLast
rsc1.Close
MsgBox "La Operación se ha efectuado satifactoriamente"
End If
cmdcan_Click
fin
```

**cmdcan_Click**
```vb
limpia Me
mancmd Me, "can"
fgrilla
Frame1.Visible = False
```

**cmdmod_Click**
```vb
mancmd Me, "mod"
modi = 1
```

**cmdnue_Click**
```vb
txtApe.SetFocus
mancmd Me, "nue"
modi = 0
ini
rsc1.Open "Select * from Libros", cn, adOpenStatic, adLockOptimistic
txtid = rsc1.RecordCount + 1
rsc1.Close
IdCli = 1
fin
```

**cmdpres_Click**
```vb
FrmPres.txtidL = txtid
FrmPres.txttit = txtnom
FrmPres.Show
Unload Me
```

**cmdreg_Click**
```vb
ini
                                If rsc1.State = 1 Then rsc1.Close
On Error GoTo xerror
mancmd Me, "reg"
If modi = 1 Then
cn.Execute "Update Libros Set Titulo = '" & txtApe & "', Autor = '" & _
txtnom & "', Estado = '" & txtesta & "', Socio = " & txtIdSo & ", FecPres = #" & txtfecp & _
"#, FecDev = #" & txtfecd & "#, dias = " & txtdias & " Where IdLibro = " & txtid

Else
rsc1.Open "Select IdLibro from Libros order by IdLibro", cn, adOpenStatic, adLockOptimistic
If rsc1.RecordCount > 0 Then
rsc1.MoveLast
IdCli = rsc1!IdLibro + 1
Else
IdCli = 1
End If
                                If rsc1.State = 1 Then rsc1.Close
cn.Execute "Insert Into Libros Values(" & IdCli & ", '" & txtApe & "', '" & txtnom & _
"', '" & txtesta & "', " & txtIdSo & ", #" & txtfecp & "#, #" & txtfecd & "#, " & txtdias & ", 'Si' )"
End If
MsgBox "Operacion exitosa"
cmdcan_Click
cmdbus.Enabled = False
FrameABM.Visible = False
Frame2.Visible = False
fin
Exit Sub
xerror:
If Err.Number = -2147217900 Then
MsgBox "Tiene  que completar los datos faltantes"
fin
Exit Sub
End If
MsgBox " No se realizó operacion por: " & Err.Description & Err.Number
fin
```

**cmdsal_Click**
```vb
Unload Me
```

**Command2_Click**
```vb
txtbape = "%"
Command1_Click
```

**Command3_Click**
```vb
Frame1.Visible = False
FrameABM.Visible = True
cmdnue.Enabled = True
```

**Command4_Click**
```vb
ini
If rsc1.State = 1 Then rsc1.Close
rsc1.Open "Select Apellidos, Nombres, Domicilio, Telefono From Cliente where IdCliente = " & _
txtIdSo, cn, adOpenStatic, adLockOptimistic
MsgBox "Socio: " & rsc1.Fields(0) & "; " & rsc1.Fields(1) & "; Dir: " & rsc1.Fields(2) & _
"; Tel: " & rsc1.Fields(3), vbInformation, "[BIBLIOTECA] Datos del Socio "
If rsc1.State = 1 Then rsc1.Close
fin
```

**Command5_Click**
```vb
ini
If MsgBox("ESTA SEGUO REGISTRAR ESTE" & Chr(13) & _
"LIBRO COMO DEVUELTO?", vbYesNo, "[BIBLIOTECA]Devolucion Libros") = vbYes Then

cn.Execute "Update Libros Set  Estado = 'Si' Where IdLibro = " & txtid
txtesta = "Si"
Frame2.Visible = False
End If
fin
```

**Command6_Click**
```vb
frmAYUDA.Show
```

**Form_Activate**
```vb
Me.Top = 1
Me.Left = 1000
ini '//funcion que conecta a la base de datos
'mancmd Me, "ini"
```

**grilla_Click**
```vb
With grilla
If .RowSel < 1 Then Exit Sub
txtid = .TextMatrix(.RowSel, 0)
txtApe = .TextMatrix(.RowSel, 1)
txtnom = .TextMatrix(.RowSel, 2)
txtesta = .TextMatrix(.RowSel, 3)
If .TextMatrix(.RowSel, 3) = "No" Then
Frame2.Visible = True
cmdpres.Visible = False
Else:
Frame2.Visible = False
cmdpres.Visible = True
End If

txtIdSo = .TextMatrix(.RowSel, 4)
txtfecp = .TextMatrix(.RowSel, 5)
txtfecd = .TextMatrix(.RowSel, 6)
txtdias = .TextMatrix(.RowSel, 7)
End With

cmdmod.Enabled = True
cmdbor.Enabled = True
cmdreg.Enabled = False
cmdnue.Enabled = False
'FrameABM.Visible = True
Frame1.Visible = False
```

**Command1_Click**
```vb
'Busca por legajo o nombre
'//la linea siguiente hace una rutina saltando el error para
'//que no se clave el programa, activar una vez que este todo Ok

'On Error GoTo xerror
ini
fgrilla
If rsc1.State = 1 Then rsc1.Close
With grilla
If txtbleg = "" And txtbape <> "" And txtnombre = "" Then
    rsc1.Open "Select * From Libros Where Activo = 'Si' And Titulo like '" & txtbape & "%'", cn, adOpenStatic, adLockOptimistic
    Do While rsc1.EOF = False
    .AddItem rsc1.Fields(0) & vbTab & rsc1.Fields(1) & vbTab & rsc1.Fields(2) & vbTab & rsc1.Fields(3) & vbTab & rsc1.Fields(4) & vbTab & rsc1.Fields(5) & _
    vbTab & rsc1.Fields(6) & vbTab & rsc1.Fields(7)
    rsc1.MoveNext
    Loop
    If rsc1.RecordCount = 0 Then MsgBox "No se encontró registro que coincida con las caracteristicas pedidas", vbInformation, "NO HAY REGISTROS QUE MOSTRAR"
    rsc1.Close
    .Visible = True
ElseIf txtbleg = "" And txtbape = "" And txtnombre <> "" Then
    rsc1.Open "Select * From Libros Where Activo = 'Si' And Autor like '" & txtnombre & "%'", cn, adOpenStatic, adLockOptimistic
    Do While rsc1.EOF = False
    .AddItem rsc1.Fields(0) & vbTab & rsc1.Fields(1) & vbTab & rsc1.Fields(2) & vbTab & rsc1.Fields(3) & vbTab & rsc1.Fields(4) & vbTab & rsc1.Fields(5) & _
    vbTab & rsc1.Fields(6) & vbTab & rsc1.Fields(7)
    rsc1.MoveNext
    Loop
    If rsc1.RecordCount = 0 Then MsgBox "No se encontró registro que coincida con las caracteristicas pedidas", vbInformation, "NO HAY REGISTROS QUE MOSTRAR"
    rsc1.Close
    .Visible = True
ElseIf txtbleg <> "" And txtbape = "" And txtnombre = "" Then
    rsc1.Open "SELECT * From Libros Where Activo = 'Si' And IdLibro = " & txtbleg.Text, cn, adOpenStatic, adLockOptimistic
    Do While rsc1.EOF = False
    .AddItem rsc1.Fields(0) & vbTab & rsc1.Fields(1) & vbTab & rsc1.Fields(2) & vbTab & rsc1.Fields(3) & vbTab & rsc1.Fields(4) & vbTab & rsc1.Fields(5) & _
    vbTab & rsc1.Fields(6) & vbTab & rsc1.Fields(7)
    rsc1.MoveNext
    Loop
    If rsc1.RecordCount = 0 Then MsgBox "No se encontró registro que coincida con las caracteristicas pedidas", vbInformation, "NO HAY REGISTROS QUE MOSTRAR"
    rsc1.Close
.Visible = True

Else
MsgBox "INGRESE UN DATO PARA LA BUSQUEDA", vbExclamation, "FALTA O EXCESO DE DATOS INGRESADOS"
txtbleg.SetFocus
txtbleg = ""
txtbape = ""
End If

End With
fin
Exit Sub
xerror:
MsgBox "NO SE PUDO BUSCAR POR: " & Err.Description, vbCritical, "NO SE EFECTUO EL PROCEDIMIENTO"
fin
```

**TxtApe_KeyPress**
```vb
If KeyAscii = 13 Then
SendKeys "{Tab}" '//permite que cambie de texto con el enter
KeyAscii = 0
End If
```

**TxtDir_KeyPress**
```vb
If KeyAscii = 13 Then
SendKeys "{Tab}" '//permite que cambie de texto con el enter
KeyAscii = 0
End If
If txtdir <> "" And txtApe <> "" Then
cmdreg.Enabled = True
End If
```

**txtesta_Change**
```vb
If txtApe <> "" And txtnom <> "" And txtesta = No Then
Frame2.Visible = True
Else
cmdpres.Visible = True
End If
```

**txtesta_KeyPress**
```vb
If KeyAscii = 13 And txtesta = "Si" Then
cmdpres.Visible = False
Frame2.Visible = True
cmdreg.Enabled = True
txtfecp = Format(Now, "dd/mm/yyyy")
txtfecd = Format(Now, "dd/mm/yyyy")
txtdias = 0
txtIdSo = -1
End If
```

**Txtnom_Change**
```vb
If txtApe <> "" And txtdir <> "" Then
cmdreg.Enabled = True
End If
```

**Txtnom_KeyPress**
```vb
If KeyAscii = 13 Then
SendKeys "{Tab}" '//permite que cambie de texto con el enter
KeyAscii = 0
End If
```

**txtbape_KeyPress**
```vb
If KeyAscii = 13 Then
Command1_Click
KeyAscii = 0
End If
```

**txtbleg_KeyPress**
```vb
If KeyAscii = 13 Then
txtbape.SetFocus
KeyAscii = 0
End If
```

#### Functions

**Function: fgrilla**
```vb
With grilla
.FormatString = "IdL|Titulo |Autor |Está|Socio|Fecha Prestamo|Fecha Devolucion|Dias"
.ColWidth(0) = 12
.ColWidth(1) = 2000
.ColWidth(2) = 2000
.ColWidth(3) = 500
.ColWidth(4) = 500
.ColWidth(5) = 1000
.ColWidth(6) = 1000
.ColWidth(7) = 500

.Rows = 1
End With
```

### Form: FrmPres

**Key Properties:**
| Property | Value |
|----------|-------|
| Caption | "PRESTAMO DE LIBROS" |
| Caption | "?" |
| Height | 375 |
| Left | 7440 |
| Top | 0 |
| Width | 375 |
| Caption | "Salir" |
| Height | 375 |
| Left | 6720 |
| Top | 3120 |
| Width | 855 |
| Height | 1815 |
| Left | 360 |
| Top | 1560 |
| Visible | 0   'False |
| Width | 4455 |
| Caption | "Registrar Prestamo" |
| Enabled | 0   'False |
| Height | 375 |
| Left | 5040 |
| Top | 3120 |
| Width | 1575 |
| Height | 285 |
| Left | 1200 |
| Top | 1080 |
| Width | 2415 |
| Height | 285 |
| Left | 3840 |
| Top | 1080 |
| Width | 615 |
| Height | 285 |
| Left | 360 |
| Top | 1080 |
| Width | 615 |
| Height | 285 |
| Left | 1800 |
| Top | 360 |
| Width | 1815 |
| Caption | "Consulta" |
| Height | 255 |
| Left | 3720 |
| Top | 360 |
| Width | 975 |
| Height | 285 |
| Left | 360 |
| Top | 360 |
| Width | 1095 |
| Height | 2256 |
| Left | 5040 |
| Top | 480 |
| Width | 2496 |
| Caption | "Dias Prestamo" |
| Height | 255 |
| Left | 3720 |
| Top | 840 |
| Width | 1095 |
| Caption | "Apellido del Socio" |
| Height | 255 |
| Left | 1800 |
| Top | 120 |
| Width | 1455 |
| Caption | "Titulo del Libro" |
| Height | 255 |
| Left | 1200 |
| Top | 840 |
| Width | 2055 |
| Caption | "IdLibro" |
| Height | 255 |
| Left | 360 |
| Top | 840 |
| Width | 615 |
| Caption | "Nro Socio" |
| Height | 255 |
| Left | 360 |
| Top | 120 |
| Width | 1095 |

#### Events

**cmdcons_Click**
```vb
Grilla1.Clear
Grilla1.Visible = False
If txtsocio <> "" And txtApe <> "" Then
ini
If rsc1.State = 1 Then rsc1.Close
rsc1.Open "Select Cliente.* From Cliente Where Cliente.IdCliente = " & _
txtsocio & " And Cliente.Apellidos = '" & txtApe & "'", cn, adOpenStatic, adLockOptimistic
If rsc1.RecordCount = 0 Then
MsgBox "Los Datos Ingresados NO SON VALIDOS", vbCritical, "BIBLIOTECA ADVIERTE"
fin
Exit Sub
End If

If rsc1.State = 1 Then rsc1.Close
rsc1.Open "Select Cliente.*, Libros.* From Cliente, Libros Where Cliente.IdCliente = Libros.Socio And Cliente.IdCliente = " & _
txtsocio & " And Cliente.Apellidos = '" & txtApe & "' And Libros.Estado = 'No'", cn, adOpenStatic, adLockOptimistic
If rsc1.RecordCount > 0 Then
MsgBox "Este Socio Tiene " & rsc1.RecordCount & " libros no devueltos", vbCritical, "BIBLIOTECA ADVIERTE"
With Grilla1

.Visible = True
.FormatString = " Titulo | Dia Prestamo |Dia Devolucion"
.ColWidth(0) = 2000
.ColWidth(1) = 1100
.ColWidth(2) = 1100

.Rows = 1

Do While rsc1.EOF = False
.AddItem rsc1.Fields(8) & vbTab & rsc1.Fields(12) & vbTab & rsc1.Fields(13)
rsc1.MoveNext
Loop
End With
fin
Else
cmdreg.Enabled = True
txtsocio.Locked = True
txtApe.Locked = True
End If
Else
MsgBox "Tiene que poner los datos requeridos para verificar", vbCritical, "[BIBLIOECA] ADVIERTE"
Exit Sub
End If
```

**cmdreg_Click**
```vb
Dim suma$
suma = Format(DateAdd("d", Val(txtdias), Now()), "dd/mm/yyyy")
ini
If Grilla1.Visible = False And txtidL <> "" And txtdias <> "" And txtsocio.Locked = True Then
cn.Execute "Update Libros Set  Estado = 'No', Socio = " & txtsocio & ", FecPres = #" & Format(Now(), "dd/mm/yyyy") & _
"#, FecDev = #" & suma & "#, dias = " & txtdias & "  Where IdLibro = " & txtidL
Else
MsgBox "FALTAN DATOS REQUERIDOS", vbCritical, "[BIBLIOTECA] Informa "
fin
Exit Sub
End If
MsgBox "Datos Registrados", vbInformation, "[BIBLIOTECA]Informa "
Dim ct As Control
For Each ct In FrmPres
If TypeOf ct Is TextBox Then ct = ""
Next
fin
Unload Me
```

**Command1_Click**
```vb
Unload Me
```

**Command4_Click**
```vb
frmAYUDA.Show
```

### Form: MDIForm1

**Key Properties:**
| Property | Value |
|----------|-------|
| Caption | "BIBLIOTECA" |
| Caption | "Ingreso" |
| Caption | "Password" |
| Caption | "-" |
| Caption | "Cerrar Sesion" |
| Caption | "| Socios" |
| Enabled | 0   'False |
| Caption | "|Libros" |
| Enabled | 0   'False |
| Caption | "Buscar Libro" |
| Caption | "-" |
| Caption | "Cargar Libros" |
| Caption | "| Ayuda " |
| Enabled | 0   'False |
| Caption | " | Salir |" |

#### Events

**ayuda_Click**
```vb
frmAYUDA.Show
```

**bd_Click**
```vb
Form2.Show
```

**BuscaL_Click**
```vb
frmLib.Show
```

**cargal_Click**
```vb
frmLib.FrameABM.Visible = True
frmLib.cmdcan_Click
frmLib.cmdbus.Enabled = False

frmLib.Show
```

**cerses_Click**
```vb
MDIForm1.socios = False
MDIForm1.libros.Enabled = False
```

**pass_Click**
```vb
Form1.Show
```

**salir_Click**
```vb
End
```

**socios_Click**
```vb
frmCli.Show
```

## Modules Logic

### Module: Module1

**Function: sinum**
```vb
Dim C$
C = Chr(tx)
If InStr("0123456789," & Chr(8), C) = 0 Then
sinum = 0
Else
sinum = tx
End If
```

**Function: limpia**
```vb
Dim ct As Control
For Each ct In fr
If TypeOf ct Is TextBox Then ct.Text = ""
Next
```

**Function: ini**
```vb
If cn.State = 1 Then cn.Close
cn.Open "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" & App.Path & "\Conexion\biblioteca.mdb;Persist Security Info=False"
```

**Function: fin**
```vb
cn.Close
```

**Function: silet**
```vb
As Integer
Dim a$
a = Chr(C)
If InStr("abcdefghijklmnopqrstuvwxyzáéíóúABCDEFGHYJKLMNOPQRSTUVWXYZ, " & Chr(8), a) = 0 Then
letra = 0
Else
letra = C
End If
```

**Function: mancmd**
```vb
With Parform
Select Case hace
Case "ini"
.cmdnue.Enabled = True
.cmdmod.Enabled = False
.cmdreg.Enabled = False
.cmdbus.Enabled = True
.cmdcan.Enabled = False
.cmdbor.Enabled = False

Case "ver"
.cmdnue.Enabled = True
.cmdmod.Enabled = True
.cmdreg.Enabled = False
.cmdbus.Enabled = True
.cmdcan.Enabled = False
.cmdbor.Enabled = True

Case "nue"
.cmdnue.Enabled = False
.cmdmod.Enabled = False
.cmdreg.Enabled = False
.cmdbus.Enabled = False
.cmdcan.Enabled = True
.cmdbor.Enabled = False

Case "mod"
.cmdnue.Enabled = False
.cmdmod.Enabled = False
.cmdreg.Enabled = True
.cmdbus.Enabled = False
.cmdcan.Enabled = True
.cmdbor.Enabled = False

Case "reg"
.cmdnue.Enabled = True
.cmdmod.Enabled = False
.cmdreg.Enabled = True
.cmdbus.Enabled = False
.cmdcan.Enabled = True
.cmdbor.Enabled = False

Case "can"
.cmdnue.Enabled = True
.cmdmod.Enabled = False
.cmdreg.Enabled = False
.cmdbus.Enabled = True
.cmdcan.Enabled = False
.cmdbor.Enabled = False

Case "bus"
.cmdnue.Enabled = False
.cmdmod.Enabled = False
.cmdreg.Enabled = False
.cmdbus.Enabled = False
.cmdcan.Enabled = True
.cmdbor.Enabled = False

End Select
End With
```

## Classes Logic