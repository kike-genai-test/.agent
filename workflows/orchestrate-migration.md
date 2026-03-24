---
description: Master workflow that detects legacy technology and routes to the correct migration pipeline based on the specified TARGET framework. Supports VB6, AngularJS (sources) and Angular, SAP Fiori Elements (targets). FULLY AUTOMATED.
---

# Orchestrate Migration Workflow v7.0 (Multi-Source × Multi-Target Router)

You are now in **ORCHESTRATION MODE**. Your task is to act as the primary Project Manager. Before running any migration, you **detect the legacy technology** (source) and use the **target framework specified by the user** to route to the appropriate specialized pipeline.

> [!IMPORTANT]
> This workflow runs **FULLY AUTOMATED**.
> You must manage context passing between phases. You must not execute the entire migration yourself; you must **delegate** to the specialized agents listed in each phase.
> All entities will be migrated completely. No partial samples.

## 🔴 CRITICAL: Context Passing (MANDATORY)

When invoking ANY subagent, you MUST include:
1. **The current Phase Goal**
2. **Paths to previous outputs** (e.g., "Read the schema.sql generated in Phase 2")
3. **Decisions/Context** (e.g., "Target is SAP Fiori Elements with OData V4" or "Target is Zoneless Angular 21")

> ⚠️ **VIOLATION:** Invoking a subagent without telling it *exactly* where to find the previous agent's output will cause it to hallucinate structures.

---

## Phase 0: Technology Detection, Target Resolution & Version Initialization 🔖

**Your Action:** Detect the legacy technology, resolve the migration target, then set up the workspace.

### Step 0.1: Target Resolution (FROM USER PROMPT)

> [!IMPORTANT]
> The **target framework** is NOT auto-detected — it is **specified by the user** in the orchestration prompt.
> If the user does not specify a target, **default to `angular`** for backward compatibility.

```bash
// turbo-all
# ──────────────────────────────────────────────────────
# TARGET RESOLUTION (from user prompt or environment)
# ──────────────────────────────────────────────────────
# Supported targets: angular | sapui5
# The user specifies this in the prompt, e.g.:
#   "Migrate this VB6 app to SAP Fiori Elements"  → TARGET_FRAMEWORK=sapui5
#   "Migrate this to Angular"                      → TARGET_FRAMEWORK=angular
#   "Run migration" (no target specified)           → TARGET_FRAMEWORK=angular (default)

TARGET_FRAMEWORK="${TARGET_FRAMEWORK:-angular}"

case "$TARGET_FRAMEWORK" in
  angular|Angular|ANGULAR)
    TARGET_FRAMEWORK="angular"
    echo "🎯 Target: Angular 21 (Zoneless, Standalone, Signals)"
    ;;
  sapui5|fiori|"fiori elements"|"sap fiori"|SAPUI5|SAP)
    TARGET_FRAMEWORK="sapui5"
    echo "🎯 Target: SAP Fiori Elements (OData V4, CDS Annotations, Horizon Theme)"
    ;;
  *)
    echo "❌ ERROR: Unknown target framework '$TARGET_FRAMEWORK'"
    echo "   Supported targets: angular, sapui5"
    echo "   Specify in prompt: 'Migrate to SAP Fiori Elements' or 'Migrate to Angular'"
    exit 1
    ;;
esac

export TARGET_FRAMEWORK
```

### Step 0.2: Legacy Source Detection

```bash
// turbo-all
# Dynamic Project Discovery
TARGET_REPO="${1:-${TARGET_REPO}}"

if [ -n "$TARGET_REPO" ]; then
  if [[ "$TARGET_REPO" == "http"* ]] || [[ "$TARGET_REPO" == "git@"* ]]; then
    echo "📥 Cloning remote repository: $TARGET_REPO"
    git clone "$TARGET_REPO" __downloaded_repo
    export LEGACY_DIR="$(pwd)/__downloaded_repo"
    PROJECT_NAME=$(basename "$TARGET_REPO" .git | tr '[:upper:]' '[:lower:]')
  else
    export LEGACY_DIR="$TARGET_REPO"
    PROJECT_NAME=$(basename "$TARGET_REPO" | tr '[:upper:]' '[:lower:]')
  fi
else
  # Auto-discover mode: scan for known legacy project signatures
  export LEGACY_DIR="."
  PROJECT_NAME=$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]')
fi

# ──────────────────────────────────────────────────────
# LEGACY TECHNOLOGY DETECTION
# ──────────────────────────────────────────────────────
DETECTED_TECH="unknown"

# Check for VB6
FOUND_VBP=$(find "$LEGACY_DIR" -maxdepth 3 -name "*.vbp" 2>/dev/null | head -n 1)
if [ -n "$FOUND_VBP" ]; then
  DETECTED_TECH="vb6"
  echo "🔍 Detected: VB6 project (.vbp found)"
fi

# Check for AngularJS (1.x)
if [ "$DETECTED_TECH" = "unknown" ]; then
  FOUND_ANGULARJS=$(find "$LEGACY_DIR" -maxdepth 5 \( -name "angular.js" -o -name "angular.min.js" \) 2>/dev/null | head -n 1)
  if [ -z "$FOUND_ANGULARJS" ]; then
    FOUND_ANGULARJS=$(grep -rl '"angular"' "$LEGACY_DIR"/{bower.json,package.json} 2>/dev/null | head -n 1)
  fi
  if [ -z "$FOUND_ANGULARJS" ]; then
    FOUND_ANGULARJS=$(grep -rl "angular\.module(" "$LEGACY_DIR" --include="*.js" 2>/dev/null | head -n 1)
  fi
  if [ -n "$FOUND_ANGULARJS" ]; then
    DETECTED_TECH="angularjs"
    echo "🔍 Detected: AngularJS (1.x) project"
  fi
fi

# Future: Add more detection blocks here
# Check for jQuery-only, React legacy, COBOL, etc.

if [ "$DETECTED_TECH" = "unknown" ]; then
  echo "❌ ERROR: Could not detect legacy technology in $LEGACY_DIR"
  echo "   Supported sources: VB6 (.vbp), AngularJS (angular.module)"
  echo "   Provide TARGET_REPO or place legacy source in current directory."
  exit 1
fi

echo ""
echo "══════════════════════════════════════════════════"
echo "  MIGRATION MATRIX"
echo "══════════════════════════════════════════════════"
echo "  📂 Source: $DETECTED_TECH"
echo "  🎯 Target: $TARGET_FRAMEWORK"
echo "  📁 Legacy: $LEGACY_DIR"
echo "══════════════════════════════════════════════════"
```

### Step 0.3: Version Initialization

```bash
// turbo-all
# Run version manager to create next versioned directory
VERSIONED_DIR=$(bash .agent/scripts/version_manager.sh "$PROJECT_NAME" || mkdir -p "$PROJECT_NAME-v1" && echo "$PROJECT_NAME-v1")

echo "📦 Migration will output to: $VERSIONED_DIR"

export OUTPUT_DIR="$VERSIONED_DIR/modern-app"
export ANALYSIS_DIR="$VERSIONED_DIR/analysis"
export RESULTS_DIR="$VERSIONED_DIR/results"

mkdir -p "$OUTPUT_DIR" "$ANALYSIS_DIR" "$RESULTS_DIR"

echo "✅ Version initialized"
echo "   🏷️  Source: $DETECTED_TECH"
echo "   🎯 Target: $TARGET_FRAMEWORK"
echo "   📂 Output: $OUTPUT_DIR"
echo "   📊 Analysis: $ANALYSIS_DIR"
echo "   📈 Results: $RESULTS_DIR"
```

---

## 🔀 MIGRATION ROUTER (Source × Target)

Based on the detected source AND specified target, follow the corresponding pipeline:

| Source | Target | Pipeline | Phases |
|--------|--------|----------|--------|
| `vb6` | `angular` | [VB6 → Angular Full-Stack](#vb6--angular-pipeline) | Analysis → DB → Backend → Frontend → Testing (5 phases) |
| `vb6` | `sapui5` | [VB6 → SAP Fiori Elements](#vb6--sap-fiori-elements-pipeline) | Analysis → CAP Backend (CDS + OData) → Fiori Frontend → Testing (4 phases) |
| `angularjs` | `angular` | [AngularJS → Angular Modern](#angularjs--angular-pipeline) | Analysis → Frontend → Testing (3 phases, backend optional) |
| `angularjs` | `sapui5` | [AngularJS → SAP Fiori Elements](#angularjs--sap-fiori-elements-pipeline) | Analysis → CAP Backend → Fiori Frontend → Testing (4 phases) |

> **Future combinations** can be added by creating a new detection block in Phase 0 and/or a new target in the target resolution, plus a new pipeline section below.

---

## VB6 → Angular Pipeline

### PHASE 1: COMPREHENSIVE ANALYSIS (VB6)
**Focus:** VB6 codebase discovery, metrics, and flow extraction.

**Your Action:** Execute the extraction scripts.

```bash
// turbo-all
python3 .agent/scripts/pre_flight_check.py || true

# Run parallel extraction
python3 .agent/scripts/vb6_comprehensive_scanner.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/inventory.json --pretty &
python3 .agent/scripts/vb6_metrics_analyzer.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/metrics.json --pretty &
python3 .agent/scripts/vb6_dead_code_detector.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/dead_code.json --pretty &
python3 .agent/scripts/vb6_schema_extractor.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/schema.json &
wait

# Generate summaries
python3 .agent/scripts/vb6_logic_extractor.py ${ANALYSIS_DIR}/inventory.json -o ${ANALYSIS_DIR}/VB6_LOGIC_ANALYSIS.md || true
python3 .agent/scripts/html_report_generator.py ${ANALYSIS_DIR}/inventory.json -o ${ANALYSIS_DIR}/REPORT.html || true

# Exit Gate check
test -f ${ANALYSIS_DIR}/inventory.json && echo "✅ inventory.json exists"
```

**Agent:** Invoke `vb6-analyst` to generate 8 documentation artifacts from analysis data.

### PHASE 2: DATABASE MIGRATION (VB6 → Angular)
**Focus:** Translating legacy schema to strict SQLite.

**Your Action:**
1. Invoke the `db-migration-architect` agent.
2. **Context to pass:** "Read `${ANALYSIS_DIR}/inventory.json` and `${ANALYSIS_DIR}/schema.json`. Generate `schema.sql` and `seed.sql` in `${OUTPUT_DIR}/apps/backend/db`. Enforce strict SQLite types and foreign keys for ALL tables."

```bash
// turbo-all
# Validation Gate (Run AFTER db-migration-architect finishes)
cd ${OUTPUT_DIR}/apps/backend
sqlite3 db/database.db ".schema" > ${ANALYSIS_DIR}/gate-db-schema.txt || echo "❌ Schema failed"
echo "🚦 Phase 2 Gate: PASSED"
```

### PHASE 3: BACKEND API ARCHITECTURE (VB6 → Angular)
**Focus:** Generating Services, Controllers, and DTOs.

**Your Action:**
1. Invoke the `backend-architect` agent.
2. **Context to pass:** "Read the newly created `${OUTPUT_DIR}/apps/backend/db/schema.sql` and `${ANALYSIS_DIR}/VB6_LOGIC_ANALYSIS.md`. Generate strict DTOs, Express Controllers, and Services using raw SQL (NO Prisma). You MUST migrate ALL entities, no samples. Generate a complete `swagger.json`."

```bash
// turbo-all
# Validation Gate (Run AFTER backend-architect finishes)
cd ${OUTPUT_DIR}/apps/backend
npx tsc --noEmit 2>&1 | tee ${ANALYSIS_DIR}/gate-backend-tsc.txt || true
npm run build 2>&1 | tee ${ANALYSIS_DIR}/gate-backend-build.txt || true
echo "🚦 Phase 3 Gate: PASSED"
```

### PHASE 4: FRONTEND ARCHITECTURE (VB6 → Angular Zoneless)
**Focus:** Generating Angular 21 Zoneless components and Services.

**Your Action:**
1. Invoke the `angular-architect` agent.
2. **Context to pass:** "Read `${OUTPUT_DIR}/apps/backend/swagger.json`. Generate full Angular frontend using `standalone: true`, `OnPush`, and `signal()`. Generate services that match the Swagger spec perfectly."

```bash
// turbo-all
# Validation Gate (Run AFTER angular-architect finishes)
cd ${OUTPUT_DIR}/apps/frontend
npx tsc --noEmit 2>&1 | tee ${ANALYSIS_DIR}/gate-frontend-tsc.txt || true
npx ng lint || true
npx ng build --configuration production 2>&1 | tee ${ANALYSIS_DIR}/gate-frontend-build.txt || true
echo "🚦 Phase 4 Gate: PASSED"
```

### PHASE 5: QUALITY, TESTING & SELF-HEALING (VB6 → Angular)
**Focus:** Generate unit tests and auto-repair failures.

**Your Action:**
1. Invoke the `testing-verifier` agent to generate unit tests.
2. If tests fail, invoke `testing-verifier` again multiple times (up to 5 loops) to auto-fix the errors based on the output logs.

```bash
// turbo-all
# Testing Gate
(cd ${OUTPUT_DIR}/apps/backend && npm test -- --coverage > ${ANALYSIS_DIR}/unit-output-backend.txt) &
(cd ${OUTPUT_DIR}/apps/frontend && npm test -- --coverage > ${ANALYSIS_DIR}/unit-output-frontend.txt) &
wait

# Final Audit & Dashboards
python3 .agent/skills/security-reviewer/scripts/security_audit.py --frontend ${OUTPUT_DIR}/apps/frontend/src --backend ${OUTPUT_DIR}/apps/backend/src --output ${ANALYSIS_DIR}/security-final.json || true
python3 .agent/scripts/final_report_generator.py --project-dir . --analysis-dir ${ANALYSIS_DIR} --output ${RESULTS_DIR}/MIGRATION_DASHBOARD.html || true
```

---

## VB6 → SAP Fiori Elements Pipeline

### PHASE 1: COMPREHENSIVE ANALYSIS (VB6)
**Focus:** VB6 codebase discovery, metrics, and flow extraction.

**Your Action:** Execute the same VB6 extraction scripts (analysis is source-dependent, not target-dependent).

```bash
// turbo-all
python3 .agent/scripts/pre_flight_check.py || true

# Run parallel extraction
python3 .agent/scripts/vb6_comprehensive_scanner.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/inventory.json --pretty &
python3 .agent/scripts/vb6_metrics_analyzer.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/metrics.json --pretty &
python3 .agent/scripts/vb6_dead_code_detector.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/dead_code.json --pretty &
python3 .agent/scripts/vb6_schema_extractor.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/schema.json &
wait

# Generate summaries
python3 .agent/scripts/vb6_logic_extractor.py ${ANALYSIS_DIR}/inventory.json -o ${ANALYSIS_DIR}/VB6_LOGIC_ANALYSIS.md || true
python3 .agent/scripts/html_report_generator.py ${ANALYSIS_DIR}/inventory.json -o ${ANALYSIS_DIR}/REPORT.html || true

# Exit Gate check
test -f ${ANALYSIS_DIR}/inventory.json && echo "✅ inventory.json exists"
```

**Agent:** Invoke `vb6-analyst` to generate 8 documentation artifacts from analysis data.

### PHASE 2: SAP CAP BACKEND + CDS SCHEMA (VB6 → Fiori)
**Focus:** Generating CDS entity definitions, OData V4 service, annotations, and service handlers from VB6 legacy analysis.

**Your Action:**
1. Invoke the `sapui5-architect` agent.
2. **Context to pass:** "This is a **VB6 → SAP Fiori Elements migration**. Read `${ANALYSIS_DIR}/inventory.json`, `${ANALYSIS_DIR}/schema.json`, and `${ANALYSIS_DIR}/VB6_LOGIC_ANALYSIS.md`. Generate the complete SAP CAP backend in `${OUTPUT_DIR}`:
   - `db/schema.cds` — CDS entity definitions for ALL tables/entities
   - `srv/cat-service.cds` — OData V4 service exposure for ALL entities
   - `srv/annotations.cds` — Complete UI annotations (HeaderInfo, LineItem, SelectionFields, Facets, FieldGroups, ValueLists) for ALL entities
   - `srv/cat-service.js` — Service handlers (validation, computed fields, business rules from VB6 logic)
   - `package.json` with `@sap/cds` dependencies
   You MUST generate CDS definitions for ALL entities. No samples."

```bash
// turbo-all
# Validation Gate (Run AFTER sapui5-architect finishes CAP backend)
cd ${OUTPUT_DIR}
npx cds compile srv/ --to edmx > ${ANALYSIS_DIR}/gate-odata-metadata.xml || echo "❌ CDS compilation failed"
echo "🚦 Phase 2 Gate: PASSED"
```

### PHASE 3: FIORI ELEMENTS FRONTEND (VB6 → Fiori)
**Focus:** Generating the Fiori Elements UI application with manifest.json, Component.js, i18n, and any freestyle views.

**Your Action:**
1. Continue with the `sapui5-architect` agent (or invoke again with frontend focus).
2. **Context to pass:** "Continue the **VB6 → SAP Fiori Elements migration**. The CAP backend is generated in `${OUTPUT_DIR}`. Now generate the Fiori Elements frontend in `${OUTPUT_DIR}/app/`:
   - `webapp/manifest.json` — Complete app descriptor with ALL routes, targets, dataSources
   - `webapp/Component.js` — Root UIComponent
   - `webapp/i18n/i18n.properties` — ALL user-visible strings extracted from VB6
   - `webapp/annotations/annotation.xml` — Local annotations (if needed beyond CDS)
   - Freestyle views/controllers ONLY for Dashboard, Wizards, or non-floorplan screens
   - `ui5.yaml` — UI5 tooling config with sap_horizon theme
   - `package.json` — With @ui5/cli dev dependency
   Use Fiori Elements floorplans (List Report + Object Page) for ALL standard CRUD entities. Freestyle only where floorplans genuinely cannot express the UI."

```bash
// turbo-all
# Validation Gate (Run AFTER sapui5-architect finishes frontend)
cd ${OUTPUT_DIR}/app
npx eslint webapp/ 2>&1 | tee ${ANALYSIS_DIR}/gate-fiori-lint.txt || true
npx ui5 build --clean-dest --dest dist 2>&1 | tee ${ANALYSIS_DIR}/gate-fiori-build.txt || true
echo "🚦 Phase 3 Gate: PASSED"
```

### PHASE 4: QUALITY, TESTING & SELF-HEALING (VB6 → Fiori)
**Focus:** Generate QUnit/OPA5 tests and auto-repair failures.

**Your Action:**
1. Invoke the `testing-verifier` agent to generate unit tests (QUnit for controllers, OPA5 for integration).
2. If tests fail, invoke `testing-verifier` again multiple times (up to 5 loops) to auto-fix errors.

```bash
// turbo-all
# Testing Gate
cd ${OUTPUT_DIR}/app
npx karma start 2>&1 | tee ${ANALYSIS_DIR}/unit-output-fiori.txt || true

# Verify OData metadata completeness
cd ${OUTPUT_DIR}
npx cds compile srv/ --to edmx > ${ANALYSIS_DIR}/gate-final-metadata.xml || true

# Final Audit & Dashboards
python3 .agent/skills/security-reviewer/scripts/security_audit.py --frontend ${OUTPUT_DIR}/app/webapp --output ${ANALYSIS_DIR}/security-final.json || true
python3 .agent/scripts/final_report_generator.py --project-dir . --analysis-dir ${ANALYSIS_DIR} --output ${RESULTS_DIR}/MIGRATION_DASHBOARD.html || true
```

---

## AngularJS → Angular Pipeline

### PHASE 1: COMPREHENSIVE ANALYSIS (AngularJS)
**Focus:** AngularJS codebase discovery, patterns, routes, and dependency mapping.

**Your Action:** Execute the AngularJS extraction scripts.

```bash
// turbo-all
python3 .agent/scripts/pre_flight_check.py || true

# Run parallel extraction
python3 .agent/scripts/angularjs_comprehensive_scanner.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/inventory.json --pretty &
python3 .agent/scripts/angularjs_metrics_analyzer.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/metrics.json --pretty &
python3 .agent/scripts/angularjs_dead_code_detector.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/dead_code.json --pretty &
python3 .agent/scripts/angularjs_pattern_extractor.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/patterns.json --pretty &
python3 .agent/scripts/angularjs_dependency_graph.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/dependencies.json --html ${ANALYSIS_DIR}/DEPENDENCY_GRAPH.html &
python3 .agent/scripts/angularjs_route_extractor.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/routes.json --pretty &
wait

# Generate HTML report
python3 .agent/scripts/html_report_generator.py ${ANALYSIS_DIR}/inventory.json -o ${ANALYSIS_DIR}/REPORT.html || true

# Exit Gate check
test -f ${ANALYSIS_DIR}/inventory.json && echo "✅ inventory.json exists"
```

**Agent:** Invoke `angularjs-analyst` to generate 7 documentation artifacts from analysis data.

### PHASE 2: FRONTEND MIGRATION (AngularJS → Angular 21 Zoneless)
**Focus:** Generating Angular 21 Zoneless standalone components from AngularJS controllers, services, and directives.

**Your Action:**
1. Invoke the `angular-architect` agent.
2. **Context to pass:** "This is an **AngularJS migration** (not VB6). Read `${ANALYSIS_DIR}/inventory.json`, `${ANALYSIS_DIR}/patterns.json`, and `${ANALYSIS_DIR}/routes.json`. The source is AngularJS 1.x — map controllers to components, services/factories to injectables, directives to standalone components, filters to pipes, routes to app.routes.ts. Generate full Angular 21 Zoneless frontend using `standalone: true`, `OnPush`, and `signal()`. Migrate ALL controllers and services, no samples."

> **Note:** If the AngularJS app has its own backend API, you may optionally invoke `backend-architect` before this phase to generate a new backend. If the existing backend is kept, skip the backend phase and point the Angular services directly at the existing API URLs.

```bash
// turbo-all
# Validation Gate (Run AFTER angular-architect finishes)
cd ${OUTPUT_DIR}/apps/frontend
npx tsc --noEmit 2>&1 | tee ${ANALYSIS_DIR}/gate-frontend-tsc.txt || true
npx ng lint || true
npx ng build --configuration production 2>&1 | tee ${ANALYSIS_DIR}/gate-frontend-build.txt || true
echo "🚦 Phase 2 Gate: PASSED"
```

### PHASE 3: QUALITY, TESTING & SELF-HEALING (AngularJS → Angular)
**Focus:** Generate unit tests and auto-repair failures.

**Your Action:**
1. Invoke the `testing-verifier` agent to generate unit tests.
2. If tests fail, invoke `testing-verifier` again multiple times (up to 5 loops) to auto-fix the errors based on the output logs.

```bash
// turbo-all
# Testing Gate
(cd ${OUTPUT_DIR}/apps/frontend && npm test -- --coverage > ${ANALYSIS_DIR}/unit-output-frontend.txt)

# Final Audit & Dashboards
python3 .agent/skills/security-reviewer/scripts/security_audit.py --frontend ${OUTPUT_DIR}/apps/frontend/src --output ${ANALYSIS_DIR}/security-final.json || true
python3 .agent/scripts/final_report_generator.py --project-dir . --analysis-dir ${ANALYSIS_DIR} --output ${RESULTS_DIR}/MIGRATION_DASHBOARD.html || true
```

---

## AngularJS → SAP Fiori Elements Pipeline

### PHASE 1: COMPREHENSIVE ANALYSIS (AngularJS)
**Focus:** AngularJS codebase discovery, patterns, routes, and dependency mapping.

**Your Action:** Execute the same AngularJS extraction scripts (analysis is source-dependent).

```bash
// turbo-all
python3 .agent/scripts/pre_flight_check.py || true

# Run parallel extraction
python3 .agent/scripts/angularjs_comprehensive_scanner.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/inventory.json --pretty &
python3 .agent/scripts/angularjs_metrics_analyzer.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/metrics.json --pretty &
python3 .agent/scripts/angularjs_dead_code_detector.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/dead_code.json --pretty &
python3 .agent/scripts/angularjs_pattern_extractor.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/patterns.json --pretty &
python3 .agent/scripts/angularjs_dependency_graph.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/dependencies.json --html ${ANALYSIS_DIR}/DEPENDENCY_GRAPH.html &
python3 .agent/scripts/angularjs_route_extractor.py "${LEGACY_DIR}" -o ${ANALYSIS_DIR}/routes.json --pretty &
wait

# Generate HTML report
python3 .agent/scripts/html_report_generator.py ${ANALYSIS_DIR}/inventory.json -o ${ANALYSIS_DIR}/REPORT.html || true

# Exit Gate check
test -f ${ANALYSIS_DIR}/inventory.json && echo "✅ inventory.json exists"
```

**Agent:** Invoke `angularjs-analyst` to generate 7 documentation artifacts from analysis data.

### PHASE 2: SAP CAP BACKEND + CDS SCHEMA (AngularJS → Fiori)
**Focus:** Generating CDS entity definitions and OData V4 service from AngularJS services and data models.

**Your Action:**
1. Invoke the `sapui5-architect` agent.
2. **Context to pass:** "This is an **AngularJS → SAP Fiori Elements migration**. Read `${ANALYSIS_DIR}/inventory.json`, `${ANALYSIS_DIR}/patterns.json`, and `${ANALYSIS_DIR}/routes.json`. The source is AngularJS 1.x. Generate the complete SAP CAP backend in `${OUTPUT_DIR}`:
   - `db/schema.cds` — CDS entity definitions derived from AngularJS service data models and API endpoints
   - `srv/cat-service.cds` — OData V4 service exposure for ALL entities
   - `srv/annotations.cds` — Complete UI annotations for ALL entities
   - `srv/cat-service.js` — Service handlers (validation, computed fields, business rules from AngularJS services)
   - `package.json` with `@sap/cds` dependencies
   Map AngularJS `$http` endpoints to CDS entities. Map service methods to CAP handlers. You MUST generate CDS definitions for ALL entities. No samples."

> **Note:** If the AngularJS app has an existing backend API that will be preserved, you may skip CAP generation and configure the Fiori app to consume the existing REST API via a destination/proxy. In this case, generate `annotation.xml` instead of CDS annotations.

```bash
// turbo-all
# Validation Gate
cd ${OUTPUT_DIR}
npx cds compile srv/ --to edmx > ${ANALYSIS_DIR}/gate-odata-metadata.xml || echo "❌ CDS compilation failed"
echo "🚦 Phase 2 Gate: PASSED"
```

### PHASE 3: FIORI ELEMENTS FRONTEND (AngularJS → Fiori)
**Focus:** Generating the Fiori Elements UI application.

**Your Action:**
1. Continue with the `sapui5-architect` agent (or invoke again with frontend focus).
2. **Context to pass:** "Continue the **AngularJS → SAP Fiori Elements migration**. The CAP backend is generated in `${OUTPUT_DIR}`. Now generate the Fiori Elements frontend in `${OUTPUT_DIR}/app/`:
   - `webapp/manifest.json` — Complete app descriptor with ALL routes, targets, dataSources
   - `webapp/Component.js` — Root UIComponent
   - `webapp/i18n/i18n.properties` — ALL user-visible strings (extract from AngularJS templates + controllers)
   - Freestyle views/controllers ONLY for Dashboard, Wizards, or non-floorplan screens
   - `ui5.yaml` and `package.json`
   Map AngularJS controllers → Fiori floorplans. Map AngularJS routes → manifest.json routing. Map AngularJS filters → formatter.js. Map AngularJS directives → XML Fragments. Use Fiori Elements floorplans for ALL standard CRUD."

```bash
// turbo-all
# Validation Gate
cd ${OUTPUT_DIR}/app
npx eslint webapp/ 2>&1 | tee ${ANALYSIS_DIR}/gate-fiori-lint.txt || true
npx ui5 build --clean-dest --dest dist 2>&1 | tee ${ANALYSIS_DIR}/gate-fiori-build.txt || true
echo "🚦 Phase 3 Gate: PASSED"
```

### PHASE 4: QUALITY, TESTING & SELF-HEALING (AngularJS → Fiori)
**Focus:** Generate QUnit/OPA5 tests and auto-repair failures.

**Your Action:**
1. Invoke the `testing-verifier` agent to generate QUnit unit tests and OPA5 integration tests.
2. If tests fail, invoke `testing-verifier` again multiple times (up to 5 loops) to auto-fix errors.

```bash
// turbo-all
# Testing Gate
cd ${OUTPUT_DIR}/app
npx karma start 2>&1 | tee ${ANALYSIS_DIR}/unit-output-fiori.txt || true

# Verify OData metadata completeness
cd ${OUTPUT_DIR}
npx cds compile srv/ --to edmx > ${ANALYSIS_DIR}/gate-final-metadata.xml || true

# Final Audit & Dashboards
python3 .agent/skills/security-reviewer/scripts/security_audit.py --frontend ${OUTPUT_DIR}/app/webapp --output ${ANALYSIS_DIR}/security-final.json || true
python3 .agent/scripts/final_report_generator.py --project-dir . --analysis-dir ${ANALYSIS_DIR} --output ${RESULTS_DIR}/MIGRATION_DASHBOARD.html || true
```

---

## Output Format

Once all phases are complete, generate a final synthesis message in the chat for the user:

```markdown
## 🎼 Migration Orchestration Complete

### 🏷️ Source Technology
[VB6 | AngularJS | ...]

### 🎯 Target Framework
[Angular 21 Zoneless | SAP Fiori Elements]

### 🚀 Target Version
[Version directory, e.g. project-v2]

### 🤖 Agents Delegated
| # | Agent | Focus Area | Status |
|---|-------|------------|--------|
| 1 | [analyst agent] | Legacy Analysis | ✅ |
| 2 | [db-migration-architect / sapui5-architect] | DB/CDS Schema | ✅ |
| 3 | [backend-architect / sapui5-architect] | Backend API / OData Service | ✅ |
| 4 | [angular-architect / sapui5-architect] | Frontend UI | ✅ |
| 5 | testing-verifier | Self-Healing Tests | ✅ (X loops) |

### 📊 Verification Results
- [x] Frontend Production Build
- [x] Security Audit Completed
- [x] Test Coverage Met

### 🎉 Dashboard
The interactive migration report is available at:
`[VersionDir]/results/MIGRATION_DASHBOARD.html`
```

---
**Begin execution. Perform Phase 0 (detection + target resolution + init), then follow the pipeline matching the {source} × {target} combination, invoking specific agents for each domain constraint.**
