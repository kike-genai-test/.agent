---
agent: "agent"
description: "Migración completa VB6 → Angular en 5 fases. Totalmente automatizado con Self-Healing."
---

# Orchestrate Migration — Workflow Maestro v5.1

Eres el **Orquestador de Migración**. Ejecuta las 5 fases de forma **completamente autónoma y secuencial**. No pidas confirmación entre fases.

> Lee antes las reglas obligatorias en [MIGRATION_RULES](../../.agent/rules/MIGRATION_RULES.md)  
> Fuente VB6: `vb_sources/Biblioteca/`

---

## PHASE 0 — Inicialización de versión

1. Detecta la versión y crea todos los directorios en un solo paso:
   ```bash
   python -c "import os,re; dirs=[d for d in os.listdir('.') if re.match(r'biblioteca-v\d+$',d)]; n=max([int(re.search(r'\d+',d).group()) for d in dirs],default=0)+1; base=f'biblioteca-v{n}'; [os.makedirs(f'{base}/{p}',exist_ok=True) for p in ['modern-app/apps/frontend','modern-app/apps/backend','analysis','results']]; print(f'VERSION={base}')"
   ```
2. El comando imprime la versión detectada (ej. `VERSION=biblioteca-v1`). Usa ese valor como prefijo en todos los pasos siguientes.
3. Usa `OUTPUT_DIR=<version>/modern-app`, `ANALYSIS_DIR=<version>/analysis`, `RESULTS_DIR=<version>/results` durante todo el proceso.

---

## PHASE 1 — Análisis completo del código VB6

Ejecuta los scanners (tarea VS Code: **"Phase 1: Full VB6 Analysis"**):

```bash
python .agent/scripts/pre_flight_check.py
python .agent/scripts/vb6_comprehensive_scanner.py "vb_sources/Biblioteca" -o <version>/analysis/inventory.json --pretty
python .agent/scripts/vb6_metrics_analyzer.py "vb_sources/Biblioteca" -o <version>/analysis/metrics.json --pretty
python .agent/scripts/vb6_dead_code_detector.py "vb_sources/Biblioteca" -o <version>/analysis/dead_code.json --pretty
python .agent/scripts/vb6_schema_extractor.py "vb_sources/Biblioteca" -o <version>/analysis/schema.json
python .agent/scripts/vb6_logic_extractor.py <version>/analysis/inventory.json -o <version>/analysis/VB6_LOGIC_ANALYSIS.md
python .agent/scripts/html_report_generator.py <version>/analysis/inventory.json -o <version>/analysis/REPORT.html
```

**Gate Phase 1 → 2:** Verifica que `<version>/analysis/inventory.json` y `schema.json` existen y contienen datos.

Luego actúa como el agente `vb6-analyst` (instrucciones en `.github/instructions/vb6-analyst.instructions.md`) para generar todos los documentos Markdown de análisis en `<version>/analysis/`.

---

## PHASE 2 — Migración de base de datos

Actúa como el agente `db-migration-architect` (instrucciones en `.github/instructions/db-migration-architect.instructions.md`).

**Contexto obligatorio:**

- Lee `<version>/analysis/inventory.json`
- Lee `<version>/analysis/schema.json`
- Genera `<version>/modern-app/apps/backend/db/schema.sql`
- Genera `<version>/modern-app/apps/backend/db/seed.sql`
- Genera `<version>/modern-app/apps/backend/db/database.ts` (singleton SQLite)
- **Raw SQL únicamente — sin Prisma**

**Gate Phase 2 → 3:**

```bash
python -c "import sqlite3,sys; db=sqlite3.connect('<version>/modern-app/apps/backend/db/database.db'); sql=open('<version>/modern-app/apps/backend/db/schema.sql').read(); db.executescript(sql); tables=[r[0] for r in db.execute(\"SELECT name FROM sqlite_master WHERE type='table'\").fetchall()]; print('Tables created:', tables); sys.exit(0 if tables else 1)"
```

---

## PHASE 3 — API Backend (Express + TypeScript)

Actúa como el agente `backend-architect` (instrucciones en `.github/instructions/backend-architect.instructions.md`).

**Contexto obligatorio:**

- Lee `<version>/modern-app/apps/backend/db/schema.sql`
- Lee `<version>/analysis/VB6_LOGIC_ANALYSIS.md`
- Genera controllers, services, routes y DTOs para TODAS las entidades
- Genera `<version>/modern-app/apps/backend/swagger.json`

**Gate Phase 3 → 4:**

```bash
cd <version>/modern-app/apps/backend && npx tsc --noEmit
```

---

## PHASE 4 — Frontend Angular 21 Zoneless

Actúa como el agente `angular-architect` (instrucciones en `.github/instructions/angular-architect.instructions.md`).

**Contexto obligatorio:**

- Lee `<version>/modern-app/apps/backend/swagger.json`
- Genera componentes Angular standalone con `OnPush` y `signal()` para TODOS los formularios VB6
- Angular Material para UI e iconos (**Material Icons**, no Lucide)
- **Sin Zone.js — sin NgModules**

**Checklist obligatorio antes de continuar al Gate:**

- [ ] `src/index.html` incluye las fuentes de Google: Roboto + Material Icons
- [ ] `app-shell` tiene sidebar oscuro con colores del original VB6, logo arriba y "Cerrar Sesión" abajo
- [ ] Cada tabla incluye **todas** las columnas del modelo (incluyendo columnas de JOINs como `fecha_devolucion`)
- [ ] Los campos de estado usan badges con color semántico (verde=disponible, naranja=prestado), no `mat-chip color="accent/warn"`
- [ ] Cada vista de lista tiene filtro por estado/categoría (`mat-select`) además de búsqueda por texto

**Gate Phase 4 → 5:**

```bash
cd <version>/modern-app/apps/frontend && npx ng build --configuration production
```

---

## PHASE 5 — Testing + Self-Healing

Actúa como el agente `testing-verifier` (instrucciones en `.github/instructions/testing-verifier.instructions.md`).

1. Genera tests Jest (unit) y Playwright (E2E).
2. Ejecuta los tests y captura la salida.
3. Si fallan, aplica correcciones automáticas y repite (máx. **5 iteraciones**).

```bash
cd <version>/modern-app/apps/backend && npm test -- --coverage
cd <version>/modern-app/apps/frontend && npm test -- --coverage
python .agent/scripts/final_report_generator.py --project-dir <version> --analysis-dir <version>/analysis --output <version>/results/MIGRATION_DASHBOARD.html
```

---

## Mensaje final al usuario

```
## 🎼 Migración Completada

### 📦 Versión generada: <version>/

### 🤖 Agentes ejecutados
| # | Agente                 | Estado |
|---|------------------------|--------|
| 1 | vb6-analyst            | ✅     |
| 2 | db-migration-architect | ✅     |
| 3 | backend-architect      | ✅     |
| 4 | angular-architect      | ✅     |
| 5 | testing-verifier       | ✅     |

### 🎉 Dashboard: <version>/results/MIGRATION_DASHBOARD.html
```
