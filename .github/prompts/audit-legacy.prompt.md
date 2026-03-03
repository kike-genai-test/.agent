---
agent: 'agent'
description: 'Análisis profundo del código VB6. Produce artefactos de documentación. Totalmente automatizado.'
---

# Audit Legacy — Análisis VB6 Completo

Ejecuta el análisis **completo y automatizado** del proyecto VB6 en `vb_sources/Biblioteca/`.
No pidas confirmación. Analiza TODOS los archivos sin excepciones.

---

## Step 1 — Crear directorio de salida

```bash
mkdir -p biblioteca-v1/analysis
```

---

## Step 2 — Ejecutar todos los scanners

Tarea VS Code disponible: **"Phase 1: Full VB6 Analysis"**

```bash
python .agent/scripts/vb6_comprehensive_scanner.py "vb_sources/Biblioteca" -o biblioteca-v1/analysis/01_inventory.json --pretty
python .agent/scripts/vb6_metrics_analyzer.py "vb_sources/Biblioteca" -o biblioteca-v1/analysis/02_metrics.json --pretty
python .agent/scripts/vb6_dead_code_detector.py "vb_sources/Biblioteca" -o biblioteca-v1/analysis/03_dead_code.json --pretty
python .agent/scripts/vb6_hardcoded_extractor.py "vb_sources/Biblioteca" -o biblioteca-v1/analysis/04_hardcoded.json --pretty
python .agent/scripts/vb6_dependency_graph.py "vb_sources/Biblioteca" -o biblioteca-v1/analysis/05_dependencies.json --html biblioteca-v1/analysis/DEPENDENCY_GRAPH.html
python .agent/scripts/vb6_schema_extractor.py "vb_sources/Biblioteca" -o biblioteca-v1/analysis/06_schema.json --pretty
python .agent/scripts/html_report_generator.py biblioteca-v1/analysis/01_inventory.json -o biblioteca-v1/analysis/ANALYSIS_REPORT.html
```

---

## Step 3 — Generar documentación Markdown

Actúa como el agente `vb6-analyst` (instrucciones en `.github/instructions/vb6-analyst.instructions.md`) y genera los 8 documentos en `biblioteca-v1/analysis/`:

| Documento | Contenido |
|-----------|-----------|
| `VB6_INVENTORY.md` | Catálogo completo de todos los archivos |
| `VB6_LOGIC_ANALYSIS.md` | Clasificación y extracción de lógica |
| `VB6_DEPENDENCIES.md` | Matriz de dependencias |
| `VB6_RISKS.md` | Evaluación de riesgos de migración |
| `VB6_DATABASE.md` | Documentación del esquema de base de datos |
| `VB6_CLASSIFICATION.md` | Priorización de elementos |
| `VB6_SEAMS.md` | Puntos de extensión (Strangler Pattern) |
| `VB6_ROADMAP.md` | Orden de migración recomendado |

---

## Checklist de completitud

- [ ] Todos los archivos `.frm` documentados
- [ ] Todos los archivos `.bas` documentados
- [ ] Todas las queries SQL extraídas
- [ ] Todos los valores hardcodeados identificados
- [ ] `ANALYSIS_REPORT.html` generado
