---
description: Migrates ALL legacy UI artifacts (VB6 Forms or AngularJS controllers/directives) to SAP Fiori Elements with OData V4 and CDS annotations. FULLY AUTOMATED - COMPLETE MIGRATION.
---

// turbo-all

# Migrate UI to SAP Fiori Elements Workflow v1.0 (Fully Automated)

## Execution Mode

| Setting | Value |
|---------|-------|
| **Confirmation Required** | ❌ NO |
| **Migration Scope** | 🔄 ALL ENTITIES |
| **Auto-Continue** | ✅ YES |
| **Sample Mode** | ❌ DISABLED |

---

## Step 1: Identify ALL UI Artifacts

From the legacy inventory (`VB6_INVENTORY.md` or `ANGULARJS_INVENTORY.md`), get the complete list:

### VB6 Source
```
FrmDashboard.frm → Overview Page (freestyle) or Fiori Launchpad
FrmCustomers.frm → List Report + Object Page (annotation-driven)
FrmOrders.frm    → List Report + Object Page (annotation-driven)
FrmReports.frm   → Analytical List Page or Freestyle Report
FrmLogin.frm     → SAP Launchpad (handles auth) or Freestyle Login
FrmSettings.frm  → Object Page with FieldGroups
...              → ... (ALL forms)
```

### AngularJS Source
```
CustomerListCtrl    → List Report (annotation-driven)
CustomerDetailCtrl  → Object Page (annotation-driven)
OrderCtrl           → List Report + Object Page (annotation-driven)
DashboardCtrl       → Overview Page (freestyle)
LoginCtrl           → SAP Launchpad (or Freestyle Login)
customerCard (dir)  → XML Fragment
capitalize (filter) → model/formatter.js function
...                 → ... (ALL controllers, directives, filters)
```

---

## Step 1.5: Design Commitment (Fiori Guidelines)

Before generating code, define the design parameters:
1. **Density**: Compact (desktop enterprise) or Cozy (touch/tablet).
2. **Theme**: `sap_horizon` (default) / `sap_horizon_dark` / high contrast.
3. **Table Type**: ResponsiveTable (mobile-friendly) or GridTable (high-density desktop).
4. **Floorplan Distribution**: Map each legacy screen → Fiori floorplan.
5. **Output**: A documented design commitment applied to ALL generated entities.

---

## Step 2: Generate CAP Backend (OData V4 Provider)

### 2.1 CDS Schema (`db/schema.cds`)
For EACH entity in the inventory, generate:
```cds
entity EntityName {
  key ID : UUID;
  // ALL fields from legacy form/controller mapped to CDS types
  // Relationships via Association/Composition
  // Computed fields for Criticality (semantic colors)
  createdAt  : Timestamp @cds.on.insert: $now;
  modifiedAt : Timestamp @cds.on.insert: $now @cds.on.update: $now;
}
```

### 2.2 Service Definition (`srv/cat-service.cds`)
```cds
service CatalogService @(path: '/odata/v4/catalog') {
  entity EntityName as projection on db.EntityName;
  // Value help entities for ALL dropdowns
}
```

### 2.3 Service Handlers (`srv/cat-service.js`)
- Computed fields (criticality, status states)
- Validation logic (migrated from legacy business rules)
- Custom actions (if needed)

---

## Step 3: Generate ALL CDS Annotations

For EACH entity in the inventory, generate annotations in `srv/annotations.cds`:

### Required Annotation Sets Per Entity

| Annotation | Purpose | Required? |
|-----------|---------|-----------|
| `@UI.HeaderInfo` | Entity title, description, icon | ✅ Always |
| `@UI.LineItem` | Table columns for List Report | ✅ Always |
| `@UI.SelectionFields` | Filter bar fields for List Report | ✅ Always |
| `@UI.Facets` | Object Page sections | ✅ Always |
| `@UI.FieldGroup#SectionName` | Fields in each Object Page section | ✅ Always |
| `@Common.ValueList` | Dropdown/value help for reference fields | ✅ If dropdown exists |
| `@UI.HeaderFacets` | Object Page header quick info | ✅ Always |
| `@UI.DataPoint` | KPI/status in header | 🟡 If status field exists |
| `@UI.Chart` | Analytics chart | 🟡 If Analytical List Page |

---

## Step 4: Generate manifest.json (Complete Routing)

```json
{
  "sap.ui5": {
    "routing": {
      "routes": [
        // ONE route per entity list
        { "name": "EntityList", "pattern": "Entity:?query:", "target": "EntityList" },
        // ONE route per entity detail
        { "name": "EntityDetail", "pattern": "Entity({key}):?query:", "target": "EntityDetail" }
        // REPEAT for ALL entities
      ],
      "targets": {
        // ONE List Report target per entity
        "EntityList": {
          "type": "Component",
          "name": "sap.fe.templates.ListReport",
          "options": { "settings": { "contextPath": "/Entity" } }
        },
        // ONE Object Page target per entity
        "EntityDetail": {
          "type": "Component",
          "name": "sap.fe.templates.ObjectPage",
          "options": { "settings": { "contextPath": "/Entity" } }
        }
        // REPEAT for ALL entities
      }
    }
  }
}
```

---

## Step 5: Generate Freestyle Components (Non-Floorplan Only)

Only for screens that genuinely cannot use a floorplan:

### Dashboard (Freestyle)
- `view/Dashboard.view.xml` — Cards, KPIs, recent items table
- `controller/Dashboard.controller.js` — Load stats, navigation

### Custom Dialogs (Freestyle)
- `fragment/[Entity]Dialog.fragment.xml` — Quick-create dialogs
- Controller methods for open/save/cancel

### Formatters
- `model/formatter.js` — Migrated from legacy formatting functions/filters

---

## Step 6: Generate i18n (Complete Extraction)

Extract ALL user-visible strings from legacy code:

```properties
# i18n/i18n.properties

# App-level
appTitle=Application Name
appDescription=Enterprise Application Description

# Per entity (REPEAT for ALL entities)
entityTitle=Entity Name
entityTitlePlural=Entity Names
fieldName=Name
fieldEmail=Email
# ... ALL fields

# Actions
actionCreate=Create
actionEdit=Edit
actionDelete=Delete
actionSave=Save
actionCancel=Cancel

# Messages
msgSaveSuccess=Record saved successfully
msgDeleteConfirm=Are you sure you want to delete this record?
msgDeleteSuccess=Record deleted
msgError=An error occurred
```

---

## Step 7: Legacy → Fiori Mapping (Complete)

### VB6 Controls → Fiori Elements
| VB6 Control | Fiori Elements Output | Generated |
|-------------|----------------------|-----------|
| TextBox | OData property → auto Input | ✅ All |
| CommandButton | Custom action in manifest | ✅ All |
| DataGrid | `@UI.LineItem` annotation → auto Table | ✅ All |
| ComboBox | `@Common.ValueList` annotation → auto dropdown | ✅ All |
| CheckBox | Boolean CDS property → auto checkbox | ✅ All |
| DateTimePicker | Date CDS property → auto DatePicker | ✅ All |
| GroupBox/Frame | `@UI.Facets` + `@UI.FieldGroup` → auto section | ✅ All |

### VB6 Events → Fiori Lifecycle
| VB6 Event | Fiori Equivalent | Generated |
|-----------|-----------------|-----------|
| Form_Load | OData auto-fetch on navigation | ✅ All |
| Click | Custom action or navigation | ✅ All |
| Change | OData two-way binding (auto) | ✅ All |
| DblClick | ListItem navigation press | ✅ All |

### AngularJS Patterns → Fiori Elements
| AngularJS Pattern | Fiori Equivalent | Generated |
|-------------------|-----------------|-----------|
| `$scope.items` | OData list binding (auto) | ✅ All |
| `$scope.$watch()` | OData auto-refresh | ✅ All |
| `$http.get/post` | OData CRUD (auto) | ✅ All |
| `ng-repeat` | `@UI.LineItem` table (auto) | ✅ All |
| `ng-if` / `ng-show` | Expression binding `visible="{= ...}"` | ✅ All |
| `ng-model` | OData two-way binding (auto) | ✅ All |
| `ng-click` | Custom action or navigation | ✅ All |
| `.directive()` | XML Fragment | ✅ All |
| `.filter()` | `model/formatter.js` | ✅ All |

---

## Step 8: Validate Code & Build

```bash
# Lint
npx eslint webapp/

# UI5 Build
npx ui5 build --clean-dest --dest dist

# CAP Backend
cd srv && cds serve --with-mocks

# Verify OData metadata
curl http://localhost:4004/odata/v4/catalog/$metadata
```

---

## Step 9: Fiori Design Compliance Audit

1. **Theme Check**: Is `sap_horizon` applied? (No `sap_bluecrystal`)
2. **Semantic Colors**: Are statuses using Criticality annotations? (No hardcoded CSS colors)
3. **i18n Check**: Any raw strings visible in UI? (All must use `{i18n>key}`)
4. **Miller's Law**: Any Object Page section with >7 fields ungrouped?
5. **Responsive**: Does the app work in compact AND cozy density?

---

## Output

Complete SAP Fiori Elements application with:
- ✅ ALL CDS entity definitions
- ✅ ALL CDS annotations (HeaderInfo, LineItem, SelectionFields, Facets, FieldGroups, ValueLists)
- ✅ ALL manifest.json routes and targets
- ✅ Complete OData V4 service (CAP backend)
- ✅ Complete i18n properties
- ✅ Freestyle components ONLY where floorplans don't fit
- ✅ SAP Horizon theme applied
- ✅ Fiori Design Guidelines compliant

**No entities skipped. No samples. Complete migration.**
