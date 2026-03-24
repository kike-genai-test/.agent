---
name: sapui5-stack
description: Complete specifications and patterns for the target SAP Fiori Elements stack (SAPUI5 1.120+, OData V4, Fiori Launchpad, CAP-compatible).
allowed-tools: view_file, write_to_file, run_command
---

# SAP Fiori Elements Stack Manual v1.0

## 📦 Version Requirements

| Technology | Version | Package |
|------------|---------|---------|
| **SAPUI5** | 1.120+ | `@sapui5/distribution-metadata` |
| **SAP Fiori Elements** | Latest | Built-in with SAPUI5 |
| **OData** | V4 (preferred) / V2 | `sap.ui.model.odata.v4.ODataModel` |
| **SAP CAP** | Latest | `@sap/cds` (optional backend) |
| **UI5 CLI** | 3.x+ | `@ui5/cli` |
| **Node.js** | 20+ | Runtime |

> [!IMPORTANT]
> **FIORI ELEMENTS FIRST**: This stack uses Fiori Elements floorplans wherever possible. Only use freestyle SAPUI5 when a floorplan genuinely cannot express the UI requirement.

---

# 1. ⚙️ SAP Fiori Elements Specifications

## 1.1 Project Structure (SAP Fiori Elements)

```
webapp/
├── Component.js                  # Root UI5 Component
├── manifest.json                 # App descriptor (routing, models, dataSources)
├── i18n/
│   └── i18n.properties           # Internationalization texts
├── localService/
│   └── mockdata/                 # Mock OData responses for local dev
├── annotations/
│   └── annotation.xml            # CDS/OData annotations for Fiori Elements
├── ext/
│   ├── controller/               # Custom controller extensions
│   │   └── ListReportExt.controller.js
│   ├── fragment/                  # Custom UI fragments
│   │   └── CustomAction.fragment.xml
│   └── view/                     # Custom views (only if freestyle needed)
├── test/
│   ├── unit/                     # QUnit tests
│   └── integration/              # OPA5 integration tests
├── index.html                    # Standalone entry point
└── Component.js                  # UIComponent extending sap.ui.core.UIComponent
```

## 1.2 manifest.json (App Descriptor — CRITICAL)

```json
{
  "_version": "1.59.0",
  "sap.app": {
    "id": "com.company.appname",
    "type": "application",
    "title": "{{appTitle}}",
    "description": "{{appDescription}}",
    "applicationVersion": { "version": "1.0.0" },
    "dataSources": {
      "mainService": {
        "uri": "/odata/v4/catalog/",
        "type": "OData",
        "settings": {
          "odataVersion": "4.0"
        }
      }
    }
  },
  "sap.ui5": {
    "flexEnabled": true,
    "models": {
      "": {
        "dataSource": "mainService",
        "preload": true,
        "settings": {
          "synchronizationMode": "None",
          "operationMode": "Server",
          "autoExpandSelect": true,
          "earlyRequests": true,
          "groupId": "$auto"
        }
      },
      "i18n": {
        "type": "sap.ui.model.resource.ResourceModel",
        "settings": {
          "bundleName": "com.company.appname.i18n.i18n"
        }
      }
    },
    "routing": {
      "config": {
        "routerClass": "sap.m.routing.Router",
        "type": "View",
        "viewType": "XML",
        "path": "com.company.appname.view",
        "controlId": "appControl",
        "controlAggregation": "pages",
        "async": true
      },
      "routes": [],
      "targets": {}
    },
    "dependencies": {
      "minUI5Version": "1.120.0",
      "libs": {
        "sap.m": {},
        "sap.ui.core": {},
        "sap.uxap": {},
        "sap.ui.layout": {},
        "sap.f": {},
        "sap.fe.templates": {}
      }
    }
  },
  "sap.ui.generic.app": {}
}
```

## 1.3 Fiori Elements Floorplans

> [!IMPORTANT]
> Use floorplans to maximize generated UI with minimal code. Map legacy screens to the appropriate floorplan.

### List Report + Object Page (Most Common)

**Use for:** Entity lists with detail view (CRUD). Maps to legacy DataGrid/List + Edit Form.

```json
// manifest.json routing section for List Report + Object Page
{
  "sap.ui5": {
    "routing": {
      "routes": [
        {
          "name": "EntityList",
          "pattern": ":?query:",
          "target": "EntityList"
        },
        {
          "name": "EntityDetail",
          "pattern": "Entity({key}):?query:",
          "target": "EntityDetail"
        }
      ],
      "targets": {
        "EntityList": {
          "type": "Component",
          "id": "EntityList",
          "name": "sap.fe.templates.ListReport",
          "options": {
            "settings": {
              "contextPath": "/Entity",
              "variantManagement": "Page",
              "initialLoad": "Enabled",
              "controlConfiguration": {
                "@com.sap.vocabularies.UI.v1.LineItem": {
                  "tableSettings": {
                    "type": "ResponsiveTable",
                    "selectionMode": "Multi",
                    "enableExport": true,
                    "enableFullScreen": true
                  }
                }
              }
            }
          }
        },
        "EntityDetail": {
          "type": "Component",
          "id": "EntityDetail",
          "name": "sap.fe.templates.ObjectPage",
          "options": {
            "settings": {
              "contextPath": "/Entity",
              "editableHeaderContent": false
            }
          }
        }
      }
    }
  }
}
```

### Worklist

**Use for:** Task/action-based lists without complex filtering. Maps to simple legacy lists.

### Overview Page

**Use for:** Dashboards with KPIs and cards. Maps to legacy Dashboard/Main forms.

### Analytical List Page

**Use for:** Reporting with charts + table. Maps to legacy report screens.

## 1.4 OData Annotations (Fiori Elements UI Driver)

> [!IMPORTANT]
> Fiori Elements is annotation-driven. The UI is defined through CDS annotations or `annotation.xml`, NOT through HTML/XML templates.

### CDS Annotations (SAP CAP Backend)

```cds
// srv/annotations.cds
using CatalogService as service from './cat-service';

// List Report Columns
annotate service.Customers with @(
  UI: {
    // Header info
    HeaderInfo: {
      TypeName: 'Customer',
      TypeNamePlural: 'Customers',
      Title: { Value: name },
      Description: { Value: email }
    },

    // Selection fields (filter bar)
    SelectionFields: [
      name,
      status,
      country
    ],

    // Table columns
    LineItem: [
      { Value: customerNumber, Label: 'Customer No.' },
      { Value: name, Label: 'Name' },
      { Value: email, Label: 'Email' },
      { Value: phone, Label: 'Phone' },
      { Value: status, Label: 'Status',
        Criticality: statusCriticality },
      { Value: createdAt, Label: 'Created' }
    ],

    // Object Page header facets
    HeaderFacets: [
      { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#Overview' }
    ],

    // Object Page sections
    Facets: [
      { $Type: 'UI.ReferenceFacet',
        Label: 'General Information',
        Target: '@UI.FieldGroup#General' },
      { $Type: 'UI.ReferenceFacet',
        Label: 'Orders',
        Target: 'orders/@UI.LineItem' }
    ],

    // Field groups
    FieldGroup#Overview: {
      Data: [
        { Value: status, Criticality: statusCriticality },
        { Value: totalOrders }
      ]
    },
    FieldGroup#General: {
      Data: [
        { Value: name },
        { Value: email },
        { Value: phone },
        { Value: address },
        { Value: country },
        { Value: registrationDate }
      ]
    }
  }
);

// Value Help for dropdowns
annotate service.Customers with {
  status @(
    Common.ValueList: {
      CollectionPath: 'Statuses',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut',
          LocalDataProperty: status,
          ValueListProperty: 'code' },
        { $Type: 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'name' }
      ]
    }
  );
  country @(
    Common.ValueList: {
      CollectionPath: 'Countries',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut',
          LocalDataProperty: country,
          ValueListProperty: 'code' },
        { $Type: 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'name' }
      ]
    }
  );
};
```

### annotation.xml (When not using CAP)

```xml
<Annotations Target="CatalogService.Customers"
             xmlns="http://docs.oasis-open.org/odata/ns/edm">

  <Annotation Term="UI.HeaderInfo">
    <Record Type="UI.HeaderInfoType">
      <PropertyValue Property="TypeName" String="Customer"/>
      <PropertyValue Property="TypeNamePlural" String="Customers"/>
      <PropertyValue Property="Title">
        <Record Type="UI.DataField">
          <PropertyValue Property="Value" Path="name"/>
        </Record>
      </PropertyValue>
    </Record>
  </Annotation>

  <Annotation Term="UI.LineItem">
    <Collection>
      <Record Type="UI.DataField">
        <PropertyValue Property="Value" Path="customerNumber"/>
        <PropertyValue Property="Label" String="Customer No."/>
      </Record>
      <Record Type="UI.DataField">
        <PropertyValue Property="Value" Path="name"/>
        <PropertyValue Property="Label" String="Name"/>
      </Record>
      <!-- ALL fields mapped here -->
    </Collection>
  </Annotation>

  <Annotation Term="UI.SelectionFields">
    <Collection>
      <PropertyPath>name</PropertyPath>
      <PropertyPath>status</PropertyPath>
    </Collection>
  </Annotation>

</Annotations>
```

## 1.5 Component.js (Root Component)

```javascript
sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function(UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("com.company.appname.Component", {
    metadata: {
      manifest: "json"
    },

    init: function() {
      // Call the base component's init function
      UIComponent.prototype.init.apply(this, arguments);

      // Application-wide model for UI state
      var oAppModel = new JSONModel({
        busy: false,
        layout: "OneColumn"
      });
      this.setModel(oAppModel, "appView");

      // Initialize routing
      this.getRouter().initialize();
    },

    destroy: function() {
      UIComponent.prototype.destroy.apply(this, arguments);
    }
  });
});
```

## 1.6 Custom Controller Extensions (Fiori Elements)

> Use extensions ONLY when floorplan behavior needs customization. Prefer annotations first.

```javascript
// ext/controller/ListReportExt.controller.js
sap.ui.define([
  "sap/ui/core/mvc/ControllerExtension",
  "sap/m/MessageBox"
], function(ControllerExtension, MessageBox) {
  "use strict";

  return ControllerExtension.extend("com.company.appname.ext.controller.ListReportExt", {
    // Override name must match manifest.json extension config
    override: {
      // Lifecycle hooks
      onInit: function() {
        // Custom initialization
      },

      // Routing hooks
      routing: {
        onAfterBinding: function(oBindingContext) {
          // After data is bound to the view
        }
      },

      // Edit flow hooks
      editFlow: {
        onBeforeSave: function(mParameters) {
          // Custom validation before save
          return new Promise(function(resolve, reject) {
            // Validate and resolve/reject
            resolve();
          });
        },
        onAfterSave: function(mParameters) {
          MessageBox.success("Record saved successfully.");
        }
      }
    },

    // Custom actions (referenced from manifest.json)
    onCustomAction: function() {
      var oContext = this.base.getExtensionAPI().getSelectedContexts();
      // Custom logic
    }
  });
});
```

### manifest.json Extension Registration

```json
{
  "sap.ui5": {
    "extends": {
      "extensions": {
        "sap.ui.controllerExtensions": {
          "sap.fe.templates.ListReport.ListReportController": {
            "controllerName": "com.company.appname.ext.controller.ListReportExt"
          },
          "sap.fe.templates.ObjectPage.ObjectPageController": {
            "controllerName": "com.company.appname.ext.controller.ObjectPageExt"
          }
        }
      }
    }
  }
}
```

## 1.7 Freestyle SAPUI5 (Only When Floorplans Don't Fit)

### XML View Pattern

```xml
<!-- view/Dashboard.view.xml -->
<mvc:View
  controllerName="com.company.appname.controller.Dashboard"
  xmlns:mvc="sap.ui.core.mvc"
  xmlns="sap.m"
  xmlns:f="sap.f"
  xmlns:card="sap.f.cards"
  xmlns:layout="sap.ui.layout">

  <Page title="{i18n>dashboardTitle}" class="sapUiResponsivePadding">
    <content>
      <layout:Grid defaultSpan="L4 M6 S12">
        <!-- KPI Cards -->
        <f:Card class="sapUiSmallMargin">
          <f:header>
            <card:Header
              title="{i18n>totalCustomers}"
              subtitle="{appView>/stats/customerCount}"
              statusText="{i18n>active}" />
          </f:header>
        </f:Card>
      </layout:Grid>

      <!-- Data Table -->
      <Table
        id="recentOrdersTable"
        items="{/RecentOrders}"
        growing="true"
        growingThreshold="20"
        mode="SingleSelectMaster"
        selectionChange=".onOrderSelected">

        <headerToolbar>
          <OverflowToolbar>
            <Title text="{i18n>recentOrders}" />
            <ToolbarSpacer />
            <SearchField search=".onSearch" width="300px" />
          </OverflowToolbar>
        </headerToolbar>

        <columns>
          <Column><Text text="{i18n>orderNumber}" /></Column>
          <Column><Text text="{i18n>customer}" /></Column>
          <Column><Text text="{i18n>amount}" /></Column>
          <Column><Text text="{i18n>status}" /></Column>
        </columns>

        <items>
          <ColumnListItem type="Navigation" press=".onOrderPress">
            <cells>
              <ObjectIdentifier title="{orderNumber}" />
              <Text text="{customerName}" />
              <ObjectNumber number="{amount}" unit="EUR" />
              <ObjectStatus text="{status}" state="{statusState}" />
            </cells>
          </ColumnListItem>
        </items>
      </Table>
    </content>
  </Page>
</mvc:View>
```

### Controller Pattern (Freestyle)

```javascript
// controller/Dashboard.controller.js
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function(Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
  "use strict";

  return Controller.extend("com.company.appname.controller.Dashboard", {
    onInit: function() {
      // Local view model for UI state
      var oViewModel = new JSONModel({
        busy: false,
        stats: {
          customerCount: 0,
          orderCount: 0
        }
      });
      this.getView().setModel(oViewModel, "viewModel");

      // Load initial data
      this._loadDashboardData();
    },

    _loadDashboardData: function() {
      var oModel = this.getView().getModel();
      this.getView().getModel("viewModel").setProperty("/busy", true);

      // OData V4 list binding
      var oBinding = oModel.bindList("/Customers");
      oBinding.requestContexts(0, Infinity).then(function(aContexts) {
        this.getView().getModel("viewModel").setProperty(
          "/stats/customerCount", aContexts.length
        );
        this.getView().getModel("viewModel").setProperty("/busy", false);
      }.bind(this));
    },

    onSearch: function(oEvent) {
      var sQuery = oEvent.getParameter("query");
      var oTable = this.byId("recentOrdersTable");
      var oBinding = oTable.getBinding("items");

      var aFilters = [];
      if (sQuery) {
        aFilters.push(new Filter("customerName", FilterOperator.Contains, sQuery));
      }
      oBinding.filter(aFilters);
    },

    onOrderSelected: function(oEvent) {
      var oItem = oEvent.getParameter("listItem");
      var sPath = oItem.getBindingContext().getPath();
      var sOrderId = this.getView().getModel().getProperty(sPath + "/ID");

      this.getOwnerComponent().getRouter().navTo("OrderDetail", {
        key: sOrderId
      });
    },

    onOrderPress: function(oEvent) {
      var oContext = oEvent.getSource().getBindingContext();
      this.getOwnerComponent().getRouter().navTo("OrderDetail", {
        key: oContext.getProperty("ID")
      });
    }
  });
});
```

## 1.8 OData V4 Service Consumption

### List Binding (Read)

```javascript
// In controller
var oModel = this.getView().getModel();
var oListBinding = oModel.bindList("/Customers", undefined, undefined, [
  new Filter("status", FilterOperator.EQ, "Active")
]);

oListBinding.requestContexts(0, 50).then(function(aContexts) {
  aContexts.forEach(function(oContext) {
    console.log(oContext.getProperty("name"));
  });
});
```

### Create (POST)

```javascript
var oModel = this.getView().getModel();
var oListBinding = oModel.bindList("/Customers");
var oContext = oListBinding.create({
  name: "New Customer",
  email: "customer@example.com",
  status: "Active"
});

oContext.created().then(function() {
  MessageToast.show("Customer created successfully");
}).catch(function(oError) {
  MessageBox.error("Error creating customer: " + oError.message);
});
```

### Update (PATCH)

```javascript
// oContext is the binding context of the entity to update
oContext.setProperty("name", "Updated Name");
oContext.setProperty("email", "updated@example.com");

// Submit batch
this.getView().getModel().submitBatch("$auto").then(function() {
  MessageToast.show("Customer updated");
});
```

### Delete

```javascript
oContext.delete().then(function() {
  MessageToast.show("Customer deleted");
}).catch(function(oError) {
  MessageBox.error("Error deleting: " + oError.message);
});
```

## 1.9 i18n (Internationalization — Native)

```properties
# i18n/i18n.properties
appTitle=Application Name
appDescription=Enterprise Application

# Entity labels
customerTitle=Customer
customerTitlePlural=Customers
orderTitle=Order
orderTitlePlural=Orders

# Field labels
fieldName=Name
fieldEmail=Email
fieldPhone=Phone
fieldStatus=Status
fieldCreatedAt=Created At

# Actions
actionCreate=Create
actionEdit=Edit
actionDelete=Delete
actionSave=Save
actionCancel=Cancel

# Messages
msgSaveSuccess=Record saved successfully
msgDeleteConfirm=Are you sure you want to delete this record?
msgDeleteSuccess=Record deleted successfully
msgError=An error occurred
```

## 1.10 Fiori Design Guidelines (SAP Fiori 3.0)

> [!IMPORTANT]
> SAP Fiori has its own design system. Do NOT use Material Design or custom CSS themes.

### Core Principles
- **Role-Based**: UI adapts to user role and task
- **Adaptive**: Responsive across devices (desktop, tablet, phone)
- **Coherent**: Consistent look & feel across all SAP applications
- **Simple**: Focus on essential tasks, progressive disclosure

### SAP Theme (Quartz / Horizon)

```html
<!-- index.html — Use SAP Horizon theme -->
<script id="sap-ui-bootstrap"
  src="resources/sap-ui-core.js"
  data-sap-ui-theme="sap_horizon"
  data-sap-ui-compatVersion="edge"
  data-sap-ui-async="true"
  data-sap-ui-resourceroots='{"com.company.appname": "./"}'
  data-sap-ui-oninit="module:sap/ui/core/ComponentSupport">
</script>
```

### Fiori Semantic Colors (Status Mapping)
| Semantic | Fiori State | Use For |
|----------|-------------|---------|
| Positive / Success | `Success` / `8` | Active, Approved, Completed |
| Critical / Warning | `Warning` / `2` | Pending, Review, Expiring |
| Negative / Error | `Error` / `1` | Rejected, Failed, Overdue |
| Information | `Information` / `5` | Draft, New, In Progress |
| Neutral | `None` / `0` | Default state |

## 1.11 UI5 Tooling & Build

### package.json

```json
{
  "name": "com.company.appname",
  "version": "1.0.0",
  "scripts": {
    "start": "ui5 serve --open index.html",
    "build": "ui5 build --clean-dest --dest dist",
    "lint": "eslint webapp",
    "test": "karma start",
    "deploy": "fiori deploy --config ui5-deploy.yaml"
  },
  "devDependencies": {
    "@ui5/cli": "^3.0.0",
    "@sap/ux-specification": "latest",
    "eslint": "^8.0.0"
  }
}
```

### ui5.yaml

```yaml
specVersion: "3.0"
metadata:
  name: com.company.appname
type: application
framework:
  name: SAPUI5
  version: "1.120.0"
  libraries:
    - name: sap.m
    - name: sap.ui.core
    - name: sap.uxap
    - name: sap.f
    - name: sap.fe.templates
    - name: sap.ui.layout
    - name: themelib_sap_horizon
```

## 1.12 Testing (QUnit + OPA5)

### Unit Test

```javascript
// test/unit/controller/Dashboard.controller.js
sap.ui.define([
  "com/company/appname/controller/Dashboard.controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/thirdparty/sinon",
  "sap/ui/thirdparty/sinon-qunit"
], function(DashboardController, JSONModel) {
  "use strict";

  QUnit.module("Dashboard Controller", {
    beforeEach: function() {
      this.oController = new DashboardController();
    },
    afterEach: function() {
      this.oController.destroy();
    }
  });

  QUnit.test("onInit sets default view model", function(assert) {
    // Arrange & Act & Assert
    assert.ok(this.oController, "Controller instantiated");
  });
});
```

### OPA5 Integration Test

```javascript
// test/integration/pages/CustomerList.js
sap.ui.define([
  "sap/ui/test/Opa5",
  "sap/ui/test/actions/Press",
  "sap/ui/test/matchers/Properties"
], function(Opa5, Press, Properties) {
  "use strict";

  Opa5.createPageObjects({
    onTheCustomerListPage: {
      actions: {
        iPressTheCreateButton: function() {
          return this.waitFor({
            controlType: "sap.m.Button",
            matchers: new Properties({ text: "Create" }),
            actions: new Press(),
            errorMessage: "Create button not found"
          });
        }
      },
      assertions: {
        iSeeTheTable: function() {
          return this.waitFor({
            id: "customerTable",
            success: function() {
              Opa5.assert.ok(true, "Customer table is visible");
            },
            errorMessage: "Customer table not found"
          });
        }
      }
    }
  });
});
```

---

# 2. 📋 SAP CAP Backend (OData Provider)

> When the legacy app needs a new backend, use SAP CAP (Cloud Application Programming model) to serve OData V4.

## 2.1 CDS Schema

```cds
// db/schema.cds
namespace com.company.appname;

entity Customers {
  key ID        : UUID;
  customerNumber : String(20) @mandatory;
  name          : String(100) @mandatory;
  email         : String(100);
  phone         : String(20);
  address       : String(200);
  country       : String(3);
  status        : String(20) default 'Active';
  statusCriticality : Integer; // Computed for UI semantic coloring
  registrationDate  : Date;
  createdAt     : Timestamp @cds.on.insert: $now;
  modifiedAt    : Timestamp @cds.on.insert: $now @cds.on.update: $now;
  orders        : Composition of many Orders on orders.customer = $self;
}

entity Orders {
  key ID        : UUID;
  orderNumber   : String(20) @mandatory;
  customer      : Association to Customers;
  amount        : Decimal(15,2);
  currency      : String(3) default 'EUR';
  status        : String(20) default 'New';
  statusState   : String(20); // Computed: Success, Warning, Error
  orderDate     : Date;
  createdAt     : Timestamp @cds.on.insert: $now;
}
```

## 2.2 Service Definition

```cds
// srv/cat-service.cds
using { com.company.appname as db } from '../db/schema';

service CatalogService @(path: '/odata/v4/catalog') {
  entity Customers as projection on db.Customers;
  entity Orders as projection on db.Orders;

  // Value help entities
  @readonly entity Statuses {
    key code : String(20);
    name     : String(50);
  };

  @readonly entity Countries {
    key code : String(3);
    name     : String(100);
  };
}
```

## 2.3 Service Implementation

```javascript
// srv/cat-service.js
const cds = require('@sap/cds');

module.exports = class CatalogService extends cds.ApplicationService {
  init() {
    const { Customers, Orders } = this.entities;

    // Compute status criticality before READ
    this.after('READ', Customers, (each) => {
      if (Array.isArray(each)) {
        each.forEach(this._computeCriticality);
      } else if (each) {
        this._computeCriticality(each);
      }
    });

    // Validation before CREATE
    this.before('CREATE', Customers, (req) => {
      if (!req.data.name) {
        req.error(400, 'Name is required');
      }
      if (req.data.email && !req.data.email.includes('@')) {
        req.error(400, 'Invalid email format');
      }
    });

    return super.init();
  }

  _computeCriticality(customer) {
    switch (customer.status) {
      case 'Active':   customer.statusCriticality = 3; break; // Positive
      case 'Inactive': customer.statusCriticality = 2; break; // Critical
      case 'Blocked':  customer.statusCriticality = 1; break; // Negative
      default:         customer.statusCriticality = 0; break; // Neutral
    }
  }
};
```

---

# 3. 📋 Validation & Quality Gates

## UI5 Build Validation

```bash
# Lint
npx eslint webapp/

# Build (production)
npx ui5 build --clean-dest --dest dist

# Run unit tests
npx karma start

# OPA5 integration tests
npx karma start karma-ci-opa5.conf.js
```

## Fiori Elements Validation Checklist

| Check | Command/Verification | Required |
|-------|---------------------|----------|
| manifest.json valid | `npx ui5 serve` starts without errors | ✅ |
| OData metadata loads | Browser → `/odata/v4/catalog/$metadata` returns XML | ✅ |
| Annotations render UI | List Report shows columns defined in annotations | ✅ |
| i18n keys resolve | No `{i18n>key}` visible in rendered UI | ✅ |
| Lint passes | `npx eslint webapp/` → 0 errors | ✅ |
| Build succeeds | `npx ui5 build` → dist/ folder created | ✅ |
| Theme applied | `sap_horizon` theme visible (not `sap_bluecrystal`) | ✅ |
