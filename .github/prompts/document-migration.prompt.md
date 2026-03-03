---
agent: 'agent'
description: 'Genera reportes HTML interactivos de todas las fases de migración. Totalmente automatizado.'
---

# Document Migration — Dashboard y Reportes

Actúa como el agente `migration-documenter` (instrucciones en `.github/instructions/migration-documenter.instructions.md`).

Escanea todos los artefactos de las fases anteriores y genera el dashboard final.

---

## Step 1 — Crear directorio

```bash
mkdir -p biblioteca-v1/results
```

---

## Step 2 — Generar dashboard principal

```bash
python .agent/scripts/final_report_generator.py \
  --project-dir biblioteca-v1 \
  --analysis-dir biblioteca-v1/analysis \
  --output biblioteca-v1/results/MIGRATION_DASHBOARD.html
```

Tarea VS Code disponible: **"Generate Migration Dashboard"**

---

## Step 3 — Generar reporte detallado

```bash
python .agent/scripts/migration_report_generator.py \
  --project-dir biblioteca-v1 \
  --analysis-dir biblioteca-v1/analysis \
  --output biblioteca-v1/results/MIGRATION_REPORT.html
```

---

## Checklist del dashboard

- [ ] Resumen ejecutivo con métricas antes/después
- [ ] Lista de todos los componentes Angular generados
- [ ] Mapa de tablas migradas (Access → SQLite)
- [ ] Resultados de cobertura de tests
- [ ] Hallazgos de seguridad
- [ ] Guía de inicio rápido

**Resultado final:** `biblioteca-v1/results/MIGRATION_DASHBOARD.html`
