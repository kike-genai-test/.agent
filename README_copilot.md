# 🤖 Kit de Migración Automática VB6 → Angular (VS Code + GitHub Copilot)

## 👋 ¡Bienvenido!

Este documento explica qué es este kit, para qué sirve y cómo utilizarlo desde **Visual Studio Code con GitHub Copilot Agent Mode**.

### 🎯 ¿Cuál es el objetivo?

Este **Kit de Migración** es una herramienta inteligente diseñada para **modernizar aplicaciones antiguas** (sistemas "Legacy" como aplicaciones hechas en Visual Basic 6) y convertirlas en aplicaciones web modernas.

Imagina que tienes una casa antigua que necesita reformas: tuberías nuevas, electricidad moderna y una fachada renovada. Este kit es como un equipo de construcción automático que:

1. Analiza los planos de la casa antigua (tu aplicación VB6).
2. Diseña la nueva estructura con materiales modernos (Angular, Node.js, SQLite).
3. Construye la nueva aplicación paso a paso.
4. Revisa su propio trabajo y arregla desperfectos automáticamente.

El objetivo final es entregarte una **aplicación web moderna, funcional y segura**, lista para usar, sin que tengas que escribir una sola línea de código.

---

### 🔧 Stack tecnológico de destino

| Capa              | Tecnología                             |
| ----------------- | -------------------------------------- |
| **Frontend**      | Angular 21 Zoneless + Angular Material |
| **Backend**       | Node.js + Express + TypeScript         |
| **Base de datos** | SQLite (raw SQL, sin ORMs)             |
| **Autenticación** | JWT                                    |
| **Testing**       | Jest + Playwright                      |

---

### 🚀 ¿Cómo funciona?

El kit está compuesto por agentes especializados. Cada uno es un experto en una tarea. En VS Code + Copilot, su conocimiento vive en archivos `.instructions.md` que Copilot lee automáticamente:

| Agente                      | Especialidad                                      |
| --------------------------- | ------------------------------------------------- |
| **Analista VB6** 🧐         | Entiende el código antiguo y genera un inventario |
| **Arquitecto DB** 🗄️        | Diseña y migra la base de datos a SQLite          |
| **Arquitecto Backend** ⚙️   | Crea la API REST con Express + TypeScript         |
| **Arquitecto Angular** 🎨   | Construye las pantallas modernas                  |
| **Inspector de Calidad** 🕵️ | Prueba que todo funcione y auto-repara errores    |
| **Documentador** 📊         | Genera el reporte HTML final                      |

---

### 🛠️ Requisitos previos

- **Visual Studio Code** con la extensión **GitHub Copilot** instalada y activa en **Agent Mode**
- **Node.js** v18 o superior
- **Python** 3.9 o superior (para los scripts de análisis VB6)
- **Angular CLI** v17 o superior

---

### 📁 Estructura del proyecto

```
vb_to_angular_workspace/
├── .agent/                     ← Scripts Python de análisis VB6
│   └── scripts/                ← Analizan formularios, módulos y base de datos
├── .github/
│   ├── copilot-instructions.md ← Instrucciones globales para Copilot
│   ├── prompts/                ← Comandos invocables desde Copilot Chat
│   └── instructions/           ← Instrucciones por agente especialista
├── .vscode/
│   └── tasks.json              ← Tareas para ejecutar los scripts Python
└── vb_sources/
    └── Biblioteca/             ← Aplicación VB6 a migrar
        ├── *.frm               ← Formularios VB6
        ├── *.bas               ← Módulos globales
        └── Conexion/           ← Base de datos MS Access (.mdb)
```

---

### ▶️ ¿Cómo ejecutarlo?

#### 1. Preparación

Coloca tu aplicación VB6 en la carpeta `vb_sources/`:

```
📂 vb_to_angular_workspace/
 ├── 📁 .agent
 ├── 📁 .github
 └── 📁 vb_sources/
      └── 📁 TuAplicacion/    ← Aquí van tus archivos .frm, .bas y .mdb
```

#### 2. Abrir el workspace en VS Code

```
cd vb_to_angular_workspace
code .
```

Asegúrate de que **GitHub Copilot Agent Mode** está activo en el panel de Chat.

#### 3. Iniciar la migración completa

En el panel de **Copilot Chat**, escribe:

```
#orchestrate-migration
```

¡Listo! Copilot leerá las instrucciones del kit y ejecutará las 5 fases automáticamente.

#### 4. Comandos individuales disponibles

Si solo quieres ejecutar una fase concreta:

| Comando                  | Qué hace                        |
| ------------------------ | ------------------------------- |
| `#orchestrate-migration` | ⭐ Migración completa (5 fases) |
| `#audit-legacy`          | Solo analiza el código VB6      |
| `#migrate-db`            | Solo migra la base de datos     |
| `#migrate-ui`            | Solo genera el frontend Angular |
| `#document-migration`    | Solo genera el reporte HTML     |

---

### ⏱️ ¿Qué pasará después?

Copilot trabajará en silencio pasando por 5 fases:

1. **Fase 1 — Análisis**: Lee y comprende tu código VB6 → genera `analysis/`
2. **Fase 2 — Base de datos**: Crea el schema SQLite → genera `db/database.db`
3. **Fase 3 — Backend**: Construye la API REST → genera `apps/backend/`
4. **Fase 4 — Frontend**: Crea las pantallas Angular → genera `apps/frontend/`
5. **Fase 5 — Testing**: Prueba todo y auto-repara errores → cobertura ≥80%

> ⏳ El proceso puede tardar varios minutos dependiendo del tamaño de tu aplicación.

Entre cada fase hay un **gate de salida obligatorio** — si falla, Copilot no avanza hasta resolverlo.

---

### 📦 ¿Dónde está mi nueva aplicación?

Cuando el proceso termine, encontrarás una nueva carpeta versionada (ej. `biblioteca-v1/`):

```
biblioteca-v1/
├── analysis/                   ← Inventario del código VB6 (JSON + Markdown)
├── modern-app/
│   └── apps/
│       ├── backend/            ← API Express + TypeScript + SQLite
│       └── frontend/           ← Angular 21 Zoneless + Angular Material
└── results/
    └── MIGRATION_DASHBOARD.html ← Reporte visual interactivo
```

Abre `MIGRATION_DASHBOARD.html` en el navegador para ver un resumen completo de la migración.

#### Arrancar la aplicación migrada

```bash
# Backend
cd biblioteca-v1/modern-app/apps/backend
npm install
npm run dev          # API en http://localhost:3000

# Frontend (en otra terminal)
cd biblioteca-v1/modern-app/apps/frontend
npm install
npm start            # App en http://localhost:4200
```

---

### ✅ Resumen

1. Coloca tu app VB6 en `vb_sources/`.
2. Abre VS Code y activa GitHub Copilot Agent Mode.
3. Escribe `#orchestrate-migration` en el Copilot Chat.
4. Espera a que termine y abre el reporte en `results/MIGRATION_DASHBOARD.html`.

---

_Kit desarrollado por el equipo Frontend de Accenture — FY26_
