---
name: sapui5-mapping
description: Complete mapping tables for migrating legacy UI artifacts (VB6, AngularJS) to SAP Fiori Elements / SAPUI5 controls, patterns, and OData services.
allowed-tools: view_file, grep_search, find_by_name, run_command
---

# SAP UI5 Legacy Mapping Manual v1.0 (Migration-Oriented)

---

## 🎯 Floorplan Selection (FIRST DECISION)

> Before mapping individual controls, map each legacy screen to a Fiori Elements floorplan.

### Legacy Screen → Fiori Floorplan

| Legacy Screen Pattern | Fiori Elements Floorplan | When to Use |
|----------------------|--------------------------|-------------|
| Entity List / DataGrid with filters | **List Report** | CRUD list with filter bar, sorting, grouping |
| Entity Detail / Edit Form | **Object Page** | Detail view with sections, header, actions |
| Dashboard / Main Menu | **Overview Page** | KPI cards, charts, quick links |
| Report with charts + table | **Analytical List Page** | Analytics with visual filters |
| Simple task list (no filters) | **Worklist** | Action-oriented flat list |
| Wizard / Multi-step form | **Freestyle** (sap.m.Wizard) | Sequential data entry |
| Login / Authentication | **Freestyle** (SAP Launchpad handles auth) | Or custom login if standalone |
| Tree / Hierarchy view | **Freestyle** (sap.ui.table.TreeTable) | Hierarchical data display |

> 🔴 **RULE:** If a floorplan fits, use it. Freestyle is the LAST resort.

---

## 📋 VB6 → SAP Fiori Mapping

### VB6 Controls → SAPUI5 Controls

| VB6 Control | SAPUI5 Control | XML View Snippet | Notes |
|-------------|---------------|-------------------|-------|
| `TextBox` | `sap.m.Input` | `<Input value="{name}" />` | Bound to OData property |
| `Label` | `sap.m.Label` | `<Label text="{i18n>fieldName}" />` | Always use i18n |
| `CommandButton` | `sap.m.Button` | `<Button text="{i18n>actionSave}" press=".onSave" type="Emphasized" />` | Use `type` for visual hierarchy |
| `ComboBox` / `DataCombo` | `sap.m.ComboBox` or Value Help | `<ComboBox items="{/Statuses}"><core:Item key="{code}" text="{name}" /></ComboBox>` | Prefer OData Value Help in Fiori Elements |
| `CheckBox` | `sap.m.CheckBox` | `<CheckBox selected="{active}" />` | Direct binding |
| `OptionButton` (Radio) | `sap.m.RadioButtonGroup` | `<RadioButtonGroup><RadioButton text="Option A" /></RadioButtonGroup>` | Group related options |
| `MSFlexGrid` / `DataGrid` | `sap.m.Table` or `sap.ui.table.Table` | See List Report floorplan | Responsive vs Grid table |
| `ListView` | `sap.m.List` | `<List items="{/Items}"><StandardListItem title="{name}" /></List>` | Simple lists |
| `DateTimePicker` | `sap.m.DatePicker` | `<DatePicker value="{date}" valueFormat="yyyy-MM-dd" />` | OData date formatting |
| `Frame` / `GroupBox` | `sap.ui.layout.form.SimpleForm` | See Form section below | Visual grouping |
| `TabStrip` / `SSTab` | `sap.m.IconTabBar` | `<IconTabBar><IconTabFilter text="Tab 1"><content>...</content></IconTabFilter></IconTabBar>` | Or Object Page sections |
| `TreeView` | `sap.m.Tree` | `<Tree items="{path: '/', parameters: {arrayNames: ['children']}}">` | Hierarchical data |
| `ProgressBar` | `sap.m.ProgressIndicator` | `<ProgressIndicator percentValue="{progress}" displayValue="{progress}%" />` | |
| `StatusBar` | `sap.m.MessageStrip` | `<MessageStrip text="{statusText}" type="{statusType}" />` | Info / Warning / Error |
| `MsgBox` | `sap.m.MessageBox` | `MessageBox.confirm("Are you sure?", { ... })` | In controller JS |
| `InputBox` | `sap.m.Dialog` with `sap.m.Input` | Custom dialog pattern | See Dialog section |
| `PictureBox` | `sap.m.Image` | `<Image src="{imageUrl}" width="100px" />` | |
| `RichTextBox` | `sap.ui.richtexteditor.RichTextEditor` | Requires `sap.ui.richtexteditor` lib | Heavy control |
| `Timer` | `setInterval` in controller | JS standard | Clean up in `onExit` |

### VB6 Events → SAPUI5 Events

| VB6 Event | SAPUI5 Equivalent | Pattern |
|-----------|-------------------|---------|
| `Form_Load` | `onInit()` | Controller lifecycle |
| `Form_Unload` | `onExit()` | Controller lifecycle |
| `Click` | `press` event | `press=".onButtonPress"` |
| `DblClick` | `press` on ListItem (type="Active") | `press=".onItemPress"` |
| `Change` | `change` / `liveChange` | `liveChange=".onSearchChange"` |
| `LostFocus` / `Validate` | `change` event | `change=".onFieldChange"` |
| `KeyPress` | `submit` (Enter key) | `submit=".onSubmit"` on Input |
| `Form.Show vbModal` | `sap.m.Dialog.open()` | Dialog pattern in controller |
| `Form.Hide` | `sap.m.Dialog.close()` or `navBack()` | Navigation or dialog close |
| `Timer` event | `setInterval` / `setTimeout` | JS timer in controller |

### VB6 Data Access → OData Operations

| VB6 Pattern | OData V4 Equivalent | Method |
|-------------|---------------------|--------|
| `rs.Open "SELECT * FROM..."` | `oModel.bindList("/Entity")` | GET (list) |
| `rs.Open "SELECT * WHERE Id=..."` | `oModel.bindContext("/Entity(key)")` | GET (single) |
| `rs.AddNew` / `rs.Update` | `oListBinding.create({...})` | POST |
| `rs.Edit` / `rs!Field = value` / `rs.Update` | `oContext.setProperty("field", value)` | PATCH |
| `rs.Delete` | `oContext.delete()` | DELETE |
| `cn.Execute "INSERT INTO..."` | `oListBinding.create({...})` | POST |
| `cn.Execute "UPDATE..."` | `oContext.setProperty(...)` + `submitBatch` | PATCH |
| `cn.Execute "DELETE..."` | `oContext.delete()` | DELETE |

### VB6 Global State → SAPUI5 Models

| VB6 Pattern | SAPUI5 Equivalent | Implementation |
|-------------|-------------------|----------------|
| `Public gCurrentUser As String` | App-level JSONModel | `this.getOwnerComponent().getModel("appState")` |
| `Public gConnectionString` | manifest.json dataSources | Configured in app descriptor |
| `Public gUserLevel As Integer` | User Info service / JSONModel | `sap.ushell.Container.getUser()` or custom model |
| Module-level variables | Controller property or JSONModel | `this._localState = {}` or view model |

---

## 📋 AngularJS → SAP Fiori Mapping

### AngularJS Artifacts → SAPUI5 Artifacts

| AngularJS Artifact | SAPUI5 Equivalent | File Pattern |
|-------------------|-------------------|--------------|
| `.controller('ListCtrl', ...)` | List Report (annotation-driven) or Freestyle Controller | `annotations.cds` or `controller/List.controller.js` |
| `.controller('DetailCtrl', ...)` | Object Page (annotation-driven) or Freestyle Controller | `annotations.cds` or `controller/Detail.controller.js` |
| `.controller('FormCtrl', ...)` | Object Page Edit Mode or Dialog Fragment | Edit mode via Fiori Elements or `fragment/EditDialog.fragment.xml` |
| `.service('DataSvc', ...)` / `.factory(...)` | OData Model (automatic) | `manifest.json` dataSource → no manual service needed |
| `.directive('myWidget', ...)` (element) | Custom Control or Fragment | `control/MyWidget.js` or `fragment/MyWidget.fragment.xml` |
| `.directive('autoFocus', ...)` (attribute) | Custom Control delegate | Inline in controller or custom control |
| `.filter('capitalize', ...)` | Formatter function | `model/formatter.js` |
| `$routeProvider.when(...)` | `manifest.json` routing | Routes + Targets in manifest |
| `$stateProvider.state(...)` | `manifest.json` nested routing | Nested routes in manifest |
| `bower.json` / `package.json` | `package.json` + `ui5.yaml` | UI5 tooling config |
| `Gruntfile.js` / `gulpfile.js` | UI5 CLI | `npx ui5 build` |

### AngularJS Bindings → SAPUI5 Bindings

| AngularJS | SAPUI5 | Notes |
|-----------|--------|-------|
| `$scope.items` | `{/Items}` (OData binding) | No manual state — OData model handles it |
| `$scope.name = "value"` | `oModel.setProperty("/name", "value")` | JSONModel for local state |
| `$scope.$watch('x', fn)` | `oModel.bindProperty("/x").attachChange(fn)` | Or OData auto-refresh |
| `$scope.$broadcast / $emit` | `sap.ui.getCore().getEventBus()` | Event bus for cross-component comms |
| `$rootScope.globalVar` | Component-level model | `this.getOwnerComponent().getModel("appState")` |
| `$http.get('/api/x')` | OData binding (automatic) | Fiori Elements handles all HTTP |
| `$http.post('/api/x', data)` | `oListBinding.create(data)` | OData V4 create |
| `ng-repeat="item in items"` | `items="{/Items}"` + aggregation binding | `<ColumnListItem>` template |
| `ng-if="condition"` | `visible="{= ${condition} }"` | Expression binding |
| `ng-show` / `ng-hide` | `visible="{= !${hidden} }"` | Expression binding |
| `ng-model="field"` | `value="{field}"` (two-way OData binding) | Automatic in OData V4 |
| `ng-click="action()"` | `press=".onAction"` | Event handler in controller |
| `ng-class` | `class="{= ${active} ? 'active' : '' }"` | Expression binding |
| `ng-include` | `<core:Fragment fragmentName="..." type="XML" />` | XML fragments |
| `{{ expr \| filter }}` | `{path: 'field', formatter: '.formatter.method'}` | Formatter functions |

### AngularJS Service → OData (Key Difference)

> [!IMPORTANT]
> In AngularJS migrations to Angular, you manually create HttpClient services. In Fiori Elements, **OData does this automatically**. You define the schema (CDS) and annotations — the framework handles REST/CRUD.

| AngularJS Service Method | SAP Fiori Equivalent | Code Needed? |
|--------------------------|---------------------|--------------|
| `service.getAll()` | List Report OData binding | ❌ Automatic |
| `service.getById(id)` | Object Page context binding | ❌ Automatic |
| `service.create(data)` | Fiori Elements "Create" action | ❌ Automatic (via annotation) |
| `service.update(id, data)` | Fiori Elements "Edit" mode | ❌ Automatic (via annotation) |
| `service.delete(id)` | Fiori Elements "Delete" action | ❌ Automatic (via annotation) |
| Custom business logic | CAP service handler (`.before`/`.after`) | ✅ Backend only |

---

## 📋 Form Mapping Patterns

### Simple Form (< 8 Fields)

```xml
<!-- Single-section form inside Object Page or Dialog -->
<form:SimpleForm
  editable="true"
  layout="ResponsiveGridLayout"
  labelSpanXL="4" labelSpanL="4" labelSpanM="4"
  emptySpanXL="0" emptySpanL="0" emptySpanM="0"
  columnsXL="2" columnsL="2" columnsM="1">

  <form:toolbar>
    <Toolbar><Title text="{i18n>generalInfo}" /></Toolbar>
  </form:toolbar>

  <Label text="{i18n>fieldName}" />
  <Input value="{name}" required="true" />

  <Label text="{i18n>fieldEmail}" />
  <Input value="{email}" type="Email" />

  <Label text="{i18n>fieldPhone}" />
  <Input value="{phone}" type="Tel" />

  <Label text="{i18n>fieldStatus}" />
  <ComboBox selectedKey="{status}" items="{/Statuses}">
    <core:Item key="{code}" text="{name}" />
  </ComboBox>
</form:SimpleForm>
```

### Complex Form (> 8 Fields — Miller's Law Sections)

```xml
<!-- Group into sections of 5-7 fields each -->
<IconTabBar>
  <items>
    <IconTabFilter text="{i18n>sectionGeneral}" icon="sap-icon://customer">
      <form:SimpleForm editable="true" layout="ResponsiveGridLayout"
        columnsXL="2" columnsL="2" columnsM="1">
        <!-- 5-7 fields: Name, Email, Phone, Address, Country -->
      </form:SimpleForm>
    </IconTabFilter>

    <IconTabFilter text="{i18n>sectionFinancial}" icon="sap-icon://money-bills">
      <form:SimpleForm editable="true" layout="ResponsiveGridLayout"
        columnsXL="2" columnsL="2" columnsM="1">
        <!-- 5-7 fields: Credit Limit, Payment Terms, Tax ID, Bank, IBAN -->
      </form:SimpleForm>
    </IconTabFilter>

    <IconTabFilter text="{i18n>sectionNotes}" icon="sap-icon://notes">
      <!-- Notes, attachments -->
    </IconTabFilter>
  </items>
</IconTabBar>
```

---

## 📋 Dialog Pattern (Modal Replacement)

```xml
<!-- fragment/CreateCustomerDialog.fragment.xml -->
<core:FragmentDefinition
  xmlns="sap.m"
  xmlns:core="sap.ui.core"
  xmlns:form="sap.ui.layout.form">

  <Dialog title="{i18n>createCustomer}" contentWidth="600px" class="sapUiContentPadding">
    <content>
      <form:SimpleForm editable="true" layout="ResponsiveGridLayout"
        columnsL="1" columnsM="1">
        <Label text="{i18n>fieldName}" required="true" />
        <Input value="{newCustomer>/name}" />
        <Label text="{i18n>fieldEmail}" />
        <Input value="{newCustomer>/email}" type="Email" />
        <Label text="{i18n>fieldPhone}" />
        <Input value="{newCustomer>/phone}" type="Tel" />
      </form:SimpleForm>
    </content>
    <beginButton>
      <Button text="{i18n>actionSave}" type="Emphasized" press=".onSaveCustomer" />
    </beginButton>
    <endButton>
      <Button text="{i18n>actionCancel}" press=".onCancelDialog" />
    </endButton>
  </Dialog>
</core:FragmentDefinition>
```

### Dialog Controller Logic

```javascript
// Open dialog
onCreateCustomer: function() {
  if (!this._oCreateDialog) {
    this._oCreateDialog = sap.ui.xmlfragment(
      "com.company.appname.fragment.CreateCustomerDialog",
      this
    );
    this.getView().addDependent(this._oCreateDialog);
  }

  // Set empty model for new customer
  var oNewCustomerModel = new JSONModel({ name: "", email: "", phone: "" });
  this._oCreateDialog.setModel(oNewCustomerModel, "newCustomer");
  this._oCreateDialog.open();
},

onSaveCustomer: function() {
  var oData = this._oCreateDialog.getModel("newCustomer").getData();

  // Validate
  if (!oData.name) {
    MessageBox.error("Name is required");
    return;
  }

  // Create via OData
  var oModel = this.getView().getModel();
  var oListBinding = oModel.bindList("/Customers");
  oListBinding.create(oData);

  oModel.submitBatch("$auto").then(function() {
    MessageToast.show("Customer created");
    this._oCreateDialog.close();
  }.bind(this));
},

onCancelDialog: function() {
  this._oCreateDialog.close();
}
```

---

## ⚡ Quick Reference: Migration Priority Rules

1. **Floorplan first** — Can this screen be a List Report + Object Page? If yes, use annotations, not code.
2. **OData replaces services** — You do NOT write HTTP services manually. Define CDS schema + annotations → OData handles CRUD.
3. **i18n from day one** — Every user-visible string goes in `i18n.properties`. Legacy hardcoded strings get extracted.
4. **Fiori theme, not custom CSS** — Use `sap_horizon` theme. Semantic colors via `ObjectStatus` states. No manual color overrides.
5. **Fragments for reuse** — Dialogs, custom sections, shared UI blocks = XML Fragments.
6. **Formatter for display logic** — Legacy formatting functions become `model/formatter.js` methods.
