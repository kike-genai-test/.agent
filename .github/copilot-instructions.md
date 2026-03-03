# 🤖 Kit de Migración VB6 → Angular — Instrucciones para GitHub Copilot

## Contexto del Workspace

Este workspace contiene un **kit agentico de migración automática** que convierte aplicaciones legacy (Visual Basic 6) en aplicaciones web modernas (Angular + Node.js + SQLite).

### Estructura del proyecto

```
vb_to_angular_workspace/
├── .agent/                         ← Kit agentico (workflows, agentes, scripts, reglas)
│   ├── agents/                     ← Definición de los agentes especializados
│   ├── workflows/                  ← Flujos de trabajo orquestados
│   ├── scripts/                    ← Scripts Python de análisis VB6
│   ├── skills/                     ← Conocimiento especializado por área
│   └── rules/MIGRATION_RULES.md    ← Reglas y convenciones obligatorias
├── .github/
│   ├── copilot-instructions.md     ← Este archivo
│   ├── prompts/                    ← Workflows invocables desde Copilot Chat
│   └── instructions/               ← Instrucciones por agente/rol
├── .vscode/
│   ├── settings.json               ← Configuración de Copilot para este workspace
│   └── tasks.json                  ← Tareas VS Code para scripts Python
└── vb_sources/
    └── Biblioteca/                 ← Aplicación VB6 legacy a migrar
        ├── *.frm                   ← Formularios VB6
        ├── *.bas                   ← Módulos globales
        └── Conexion/biblioteca.mdb ← Base de datos MS Access
```

---

## Rol y Comportamiento de Copilot en este Workspace

Actúas como **Orquestador de Migración**. Cuando se invoque cualquier prompt de migración:

1. **Eres autónomo**: No pides confirmación para cada paso — ejecutas completamente.
2. **Delegas a agentes especializados**: Cada fase tiene instrucciones en `.github/instructions/`.
3. **Pasas contexto explícito**: Cuando delegas, siempre indicas exactamente qué archivos debe leer el siguiente agente.
4. **Ejecutas scripts Python**: Usa la terminal para correr los scripts en `.agent/scripts/`.
5. **Tratas TODOS los archivos**: Nunca generas "samples" o ejemplos parciales — migras TODO.

---

## Reglas de Migración OBLIGATORIAS

### Stack tecnológico de destino
| Capa | Tecnología | Restricciones |
|------|-----------|---------------|
| **Frontend** | Angular 21, Zoneless | `OnPush` OBLIGATORIO, Standalone, Signals |
| **Backend** | Node.js + Express + TypeScript | Arquitectura Controller → Service → DB |
| **Base de datos** | SQLite | Raw SQL (sin Prisma), Foreign Keys activados |
| **Auth** | JWT | En `localStorage` con expiración |
| **Testing** | Jest + Playwright | Cobertura mínima: 80% líneas, 70% ramas |

### Angular — Zoneless (OBLIGATORIO)
```typescript
// ✅ CORRECTO
provideExperimentalZonelessChangeDetection()
changeDetection: ChangeDetectionStrategy.OnPush
nombre = signal<string>('')

// ❌ PROHIBIDO
import 'zone.js'
ChangeDetectionStrategy.Default
@NgModule({})
implements OnInit
```

### Backend — Raw SQL (OBLIGATORIO)
```typescript
// ✅ CORRECTO
db.prepare('SELECT * FROM clientes WHERE id = ?').get(id)

// ❌ PROHIBIDO — Sin Prisma
prisma.clientes.findUnique(...)
```

---

## Pipeline de Migración (5 Fases)

```
Phase 0  →  Crear directorio versionado (biblioteca-v1, v2, ...)
Phase 1  →  Análisis VB6 con scripts Python → JSONs + Markdown en analysis/
Phase 2  →  db-migration-architect → schema.sql + seed.sql (SQLite)
Phase 3  →  backend-architect → Express API + swagger.json
Phase 4  →  angular-architect → Angular 21 Zoneless + Angular Material
Phase 5  →  testing-verifier → Jest + Playwright + Self-Healing (máx 5 loops)
Final    →  MIGRATION_DASHBOARD.html interactivo
```

### Gates de salida (OBLIGATORIOS entre fases)
- **Phase 1 → 2**: `inventory.json` y `schema.json` existen con datos
- **Phase 2 → 3**: `sqlite3 db/database.db ".schema"` sin errores
- **Phase 3 → 4**: `tsc --noEmit` sin errores + `swagger.json` generado
- **Phase 4 → 5**: `ng build --configuration production` exitoso
- **Phase 5 → Deploy**: Cobertura ≥80% + build producción OK

---

## Invocación de Prompts

| Prompt | Descripción |
|--------|-------------|
| `#orchestrate-migration` | ⭐ Migración completa automatizada (5 fases) |
| `#audit-legacy` | Solo análisis del código VB6 |
| `#migrate-db` | Solo migración de base de datos |
| `#migrate-ui` | Solo generación de frontend Angular |
| `#document-migration` | Solo generación de reportes HTML |
