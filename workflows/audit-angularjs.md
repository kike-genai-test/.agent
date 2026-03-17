---
description: Deep analysis of AngularJS (1.x) codebase. Produces documentation artifacts. FULLY AUTOMATED.
---

// turbo-all

# Audit AngularJS Legacy Workflow v1.0 (Fully Automated)

## Execution Mode

| Setting | Value |
|---------|-------|
| **Confirmation Required** | ❌ NO |
| **Auto-Continue** | ✅ YES |

---

## Step 1: Create Output Directory

```bash
mkdir -p analysis
```

---

## Step 2: Run All Scanners (Auto)

```bash
python3 .agent/scripts/angularjs_comprehensive_scanner.py "angularjs-source" -o analysis/01_inventory.json --pretty
python3 .agent/scripts/angularjs_metrics_analyzer.py "angularjs-source" -o analysis/02_metrics.json --pretty
python3 .agent/scripts/angularjs_dead_code_detector.py "angularjs-source" -o analysis/03_dead_code.json --pretty
python3 .agent/scripts/angularjs_pattern_extractor.py "angularjs-source" -o analysis/04_patterns.json --pretty
python3 .agent/scripts/angularjs_dependency_graph.py "angularjs-source" -o analysis/05_dependencies.json --html analysis/DEPENDENCY_GRAPH.html
python3 .agent/scripts/angularjs_route_extractor.py "angularjs-source" -o analysis/06_routes.json --pretty
python3 .agent/scripts/html_report_generator.py analysis/01_inventory.json -o analysis/ANALYSIS_REPORT.html
```

---

## Step 3: Generate Documentation (Auto)

Agent `angularjs-analyst` generates:

| Document | Purpose |
|----------|---------|
| `ANGULARJS_INVENTORY.md` | Complete file catalog (controllers, services, directives, filters, templates) |
| `ANGULARJS_PATTERNS.md` | Legacy pattern classification ($scope, $watch, $http, etc.) |
| `ANGULARJS_DEPENDENCIES.md` | Module and DI dependency matrix |
| `ANGULARJS_RISKS.md` | Risk assessment (jQuery, $rootScope abuse, DOM manipulation) |
| `ANGULARJS_ROUTES.md` | Route/state configuration mapping |
| `ANGULARJS_CLASSIFICATION.md` | Migration priority ranking |
| `ANGULARJS_ROADMAP.md` | Migration execution order |

---

## Step 4: Auto-Continue

After analysis completes, automatically proceed to:
- `/orchestrate-angularjs-migration` for full migration
- Or stop here if analysis-only was requested

**No human review gate.** Analysis artifacts are produced for reference but execution continues.

---

## Output Structure

```
analysis/
├── 01_inventory.json
├── 02_metrics.json
├── 03_dead_code.json
├── 04_patterns.json
├── 05_dependencies.json
├── 06_routes.json
├── DEPENDENCY_GRAPH.html
├── ANALYSIS_REPORT.html
├── ANGULARJS_INVENTORY.md
├── ANGULARJS_PATTERNS.md
├── ANGULARJS_DEPENDENCIES.md
├── ANGULARJS_RISKS.md
├── ANGULARJS_ROUTES.md
├── ANGULARJS_CLASSIFICATION.md
└── ANGULARJS_ROADMAP.md
```
