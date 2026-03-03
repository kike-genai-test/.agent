---
agent: 'agent'
description: 'Migra TODOS los formularios VB6 a componentes Angular 21 Zoneless. Sin NgModules. Sin Zone.js.'
---

# Migrate UI — Frontend Angular 21 Zoneless

Actúa como el agente `angular-architect` (instrucciones en `.github/instructions/angular-architect.instructions.md`).

Migra **TODOS** los formularios VB6 a componentes Angular. **Sin muestras parciales.**

---

## Pre-requisitos

- `biblioteca-v1/analysis/VB6_INVENTORY.md`
- `biblioteca-v1/modern-app/apps/backend/swagger.json`

---

## Step 1 — Inventario de formularios

Lee `VB6_INVENTORY.md` y mapea TODOS los formularios. Mapa base para Biblioteca:

| VB6 Form | Angular Components |
|----------|--------------------|
| `MDIForm1.frm` | `app-shell` (layout + nav) |
| `FRMCLI.FRM` | `clientes.component` + `cliente-dialog.component` |
| `FRMLIB.FRM` | `libros.component` + `libro-dialog.component` |
| `FrmPres.frm` | `prestamos.component` + `prestamo-dialog.component` |
| `frmAYUDA.frm` | `ayuda.component` |
| `Form1.frm` / `Form2.frm` | `login.component` |

---

## Step 2 — Configuración Zoneless (OBLIGATORIO)

`app.config.ts` debe incluir `provideExperimentalZonelessChangeDetection()`.  
Cada componente debe tener `changeDetection: ChangeDetectionStrategy.OnPush`.  
Estado con `signal()` — nunca variables planas.

---

## Step 3 — Generar todos los componentes

Para cada entidad: List Component + Dialog Component + Service tipado con interfaces de `swagger.json`.

---

## Step 4 — Gate de verificación

```bash
cd biblioteca-v1/modern-app/apps/frontend
npx tsc --noEmit
npx ng lint
npx ng build --configuration production
```
