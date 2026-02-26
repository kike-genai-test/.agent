---
description: Master workflow orchestrating the full VB6 to Angular migration in phases. FULLY AUTOMATED with SELF-HEALING tests. Uses SQLite with raw SQL (no Prisma).
---

# Orchestrate Migration Workflow v5.1 (Agentic Coordination)

You are now in **ORCHESTRATION MODE**. Your task is to act as the primary Project Manager coordinating specialized agents to execute a complex legacy migration from VB6 to a Modern Stack (Angular Zoneless + Node.js/SQLite).

> [!IMPORTANT]
> This workflow runs **FULLY AUTOMATED**.
> You must manage context passing between phases. You must not execute the entire migration yourself; you must **delegate** to the specialized agents listed in each phase.
> All entities will be migrated completely. No partial samples.

## 🔴 CRITICAL: Context Passing (MANDATORY)

When invoking ANY subagent, you MUST include:
1. **The current Phase Goal**
2. **Paths to previous outputs** (e.g., "Read the schema.sql generated in Phase 2")
3. **Decisions/Context** (e.g., "Use SQLite with raw SQL, NO Prisma. Frontend must be Zoneless Angular.")

> ⚠️ **VIOLATION:** Invoking a subagent without telling it *exactly* where to find the previous agent's output will cause it to hallucinate structures.

---

## Phase 0: Version Initialization 🔖

**Your Action:** Execute this block to set up the workspace.

```bash
// turbo-all
# Dynamic Project Discovery
# Usage: Set TARGET_REPO via env var before calling, OR provide it as an argument, OR default to searching for a .vbp file
TARGET_REPO="${1:-${TARGET_REPO}}"

if [ -n "$TARGET_REPO" ]; then
  # If it's a Git URL, clone it
  if [[ "$TARGET_REPO" == "http"* ]] || [[ "$TARGET_REPO" == "git@"* ]]; then
    echo "📥 Cloning remote repository: $TARGET_REPO"
    git clone "$TARGET_REPO" __downloaded_repo
    export VB6_DIR="$(pwd)/__downloaded_repo"
    VB6_PROJECT_NAME=$(basename "$TARGET_REPO" .git | tr '[:upper:]' '[:lower:]')
  else
    # It's a local path
    export VB6_DIR="$TARGET_REPO"
    VB6_PROJECT_NAME=$(basename "$TARGET_REPO" | tr '[:upper:]' '[:lower:]')
  fi
else
  # Auto-discover mode: Find first directory with a .vbp file
  FOUND_VBP=$(find . -maxdepth 3 -name "*.vbp" | head -n 1)
  if [ -n "$FOUND_VBP" ]; then
    export VB6_DIR=$(dirname "$FOUND_VBP")
    VB6_PROJECT_NAME=$(basename "$VB6_DIR" | tr '[:upper:]' '[:lower:]')
    echo "🔍 Auto-discovered project at: $VB6_DIR"
  else
    echo "❌ ERROR: No .vbp project found and no TARGET_REPO provided."
    exit 1
  fi
fi

# Run version manager to create next versioned directory
VERSIONED_DIR=$(bash .agent/scripts/version_manager.sh "$VB6_PROJECT_NAME" || mkdir -p "$VB6_PROJECT_NAME-v1" && echo "$VB6_PROJECT_NAME-v1")

echo "📦 Migration will output to: $VERSIONED_DIR"

# Set up directory variables for this migration run
export OUTPUT_DIR="$VERSIONED_DIR/modern-app"
export ANALYSIS_DIR="$VERSIONED_DIR/analysis"
export RESULTS_DIR="$VERSIONED_DIR/results"

mkdir -p "$OUTPUT_DIR" "$ANALYSIS_DIR" "$RESULTS_DIR"

echo "✅ Version initialized"
echo "   📂 Output: $OUTPUT_DIR"
echo "   📊 Analysis: $ANALYSIS_DIR"
echo "   📈 Results: $RESULTS_DIR"
```

---

## 🔴 STRICT 5-PHASE ORCHESTRATION

You must execute these phases **sequentially**. Do not move to the next phase until the verification/gate script succeeds.

### PHASE 1: COMPREHENSIVE ANALYSIS
**Focus:** Codebase discovery, metrics, and flow extraction.

**Your Action:** Execute the extraction scripts.

```bash
// turbo-all
python3 .agent/scripts/pre_flight_check.py || true

# Run parallel extraction
python3 .agent/scripts/vb6_comprehensive_scanner.py "${VB6_DIR}" -o ${ANALYSIS_DIR}/inventory.json --pretty &
python3 .agent/scripts/vb6_metrics_analyzer.py "${VB6_DIR}" -o ${ANALYSIS_DIR}/metrics.json --pretty &
python3 .agent/scripts/vb6_dead_code_detector.py "${VB6_DIR}" -o ${ANALYSIS_DIR}/dead_code.json --pretty &
python3 .agent/scripts/vb6_schema_extractor.py "${VB6_DIR}" -o ${ANALYSIS_DIR}/schema.json &
wait

# Generate summaries
python3 .agent/scripts/vb6_logic_extractor.py ${ANALYSIS_DIR}/inventory.json -o ${ANALYSIS_DIR}/VB6_LOGIC_ANALYSIS.md || true
python3 .agent/scripts/html_report_generator.py ${ANALYSIS_DIR}/inventory.json -o ${ANALYSIS_DIR}/REPORT.html || true

# Exit Gate check
test -f ${ANALYSIS_DIR}/inventory.json && echo "✅ inventory.json exists"
```

### PHASE 2: DATABASE MIGRATION
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

### PHASE 3: BACKEND API ARCHITECTURE
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

### PHASE 4: FRONTEND ARCHITECTURE (ZONELESS)
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

### PHASE 5: QUALITY, TESTING & SELF-HEALING 🔄
**Focus:** Generate unit tests and auto-repair failures.

**Your Action:**
1. Invoke the `testing-verifier` agent to generate unit tests.
2. If tests fail, invoke `testing-verifier` again multiple times (up to 5 loops) to auto-fix the errors based on the output logs.

```bash
// turbo-all
# Testing Gate (Run repeatedly during self-healing loop)
(cd ${OUTPUT_DIR}/apps/backend && npm test -- --coverage > ${ANALYSIS_DIR}/unit-output-backend.txt) &
(cd ${OUTPUT_DIR}/apps/frontend && npm test -- --coverage > ${ANALYSIS_DIR}/unit-output-frontend.txt) &
wait

# Final Audit & Dashboards
python3 .agent/skills/security-reviewer/scripts/security_audit.py --frontend ${OUTPUT_DIR}/apps/frontend/src --backend ${OUTPUT_DIR}/apps/backend/src --output ${ANALYSIS_DIR}/security-final.json || true
python3 .agent/scripts/final_report_generator.py --project-dir . --analysis-dir ${ANALYSIS_DIR} --output ${OUTPUT_DIR}/results/MIGRATION_DASHBOARD.html || true
```

---

## Output Format

Once all 5 phases are complete, generate a final synthesis message in the chat for the user:

```markdown
## 🎼 Migration Orchestration Complete

### 🚀 Target Version
[Version directory, e.g. project-v2]

### 🤖 Agents Delegated
| # | Agent | Focus Area | Status |
|---|-------|------------|--------|
| 1 | db-migration-architect | SQLite Schema Generation | ✅ |
| 2 | backend-architect | Express API & DTOs | ✅ |
| 3 | angular-architect | Zoneless Signals UI | ✅ |
| 4 | testing-verifier | Self-Healing Tests | ✅ (X loops) |

### 📊 Verification Results
- [x] Backend TypeScript Compilation
- [x] Frontend Production Build
- [x] Security Audit Completed

### 🎉 Dashboard
The interactive migration report is available at: 
`[VersionDir]/results/MIGRATION_DASHBOARD.html`
```

--- 
**Begin execution. Perform Phase 0, then proceed sequentially through all 5 phases, invoking specific agents for each domain constraint.**
