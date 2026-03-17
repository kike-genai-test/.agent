---
name: angularjs-decoding
description: Expert techniques for parsing and decoding ALL AngularJS (1.x) codebase artifacts with migration-oriented analysis patterns for Angular 21+ Zoneless.
allowed-tools: view_file, grep_search, find_by_name, run_command
---

# AngularJS Legacy Decoding Manual v1.0 (Migration-Oriented)

---

## 📁 Complete AngularJS File Type Reference

### Core Files
| Extension/Pattern | Purpose | Description | Migration Priority |
|-------------------|---------|-------------|-------------------|
| `*.module.js` | Module definition | `angular.module()` declarations | 🔴 HIGH - Entry point for DI tree |
| `*.controller.js` | Controller | `$scope`-based logic + view binding | 🔴 HIGH - Maps to components |
| `*.service.js` / `*.factory.js` | Service/Factory | Shared business logic & data access | 🔴 HIGH - Maps to injectable services |
| `*.directive.js` | Directive | Custom DOM behavior / components | 🔴 HIGH - Maps to standalone components |
| `*.component.js` | Component (1.5+) | Component-style directive | 🟡 MEDIUM - Closer to modern Angular |
| `*.filter.js` | Filter | Data transformation in templates | 🟡 MEDIUM - Maps to Pipes |
| `*.config.js` | Config block | `app.config()` routing & setup | 🔴 HIGH - Maps to app.config.ts / routes |
| `*.run.js` | Run block | `app.run()` bootstrap logic | 🟡 MEDIUM - Maps to APP_INITIALIZER |
| `*.constant.js` / `*.value.js` | Constants | Immutable values | 🟢 LOW - Direct translation |

### Template Files
| Extension | Purpose | Description | Migration Priority |
|-----------|---------|-------------|-------------------|
| `*.html` | Template | View templates with ng-* directives | 🔴 HIGH - Rewrite to Angular syntax |
| `*.tpl.html` | Inline template | Cached templates (templateUrl) | 🔴 HIGH - Inline or component template |

### Configuration & Build
| File | Purpose | Migration Strategy |
|------|---------|-------------------|
| `bower.json` | Dependency manager | Replace with `package.json` |
| `.bowerrc` | Bower config | Remove |
| `Gruntfile.js` | Task runner | Replace with Angular CLI |
| `gulpfile.js` | Task runner | Replace with Angular CLI |
| `webpack.config.js` | Bundler | Replace with Angular CLI |
| `karma.conf.js` | Test runner | Replace with Jest config |
| `protractor.conf.js` | E2E runner | Replace with Playwright |

### Style Files
| Extension | Purpose | Migration Strategy |
|-----------|---------|-------------------|
| `*.css` | Styles | Convert to SCSS, scope to components |
| `*.less` | LESS styles | Convert to SCSS |
| `*.scss` | SASS styles | Keep, scope to components |

---

## 🔍 AngularJS Pattern Classification

### 1. Controller Patterns → Components

```javascript
// CONTROLLER WITH $SCOPE (most common)
app.controller('CustomerListCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.customers = [];        // → signal<Customer[]>([])
    $scope.loading = true;        // → signal<boolean>(true)
    $scope.selectedCustomer = null; // → signal<Customer | null>(null)

    $scope.loadCustomers = function() {   // → method in component
        $http.get('/api/customers').then(function(res) {
            $scope.customers = res.data;  // → this.customers.set(res.data)
            $scope.loading = false;       // → this.loading.set(false)
        });
    };

    $scope.loadCustomers(); // → constructor + effect()
}]);
```

**Migrate to:** `customer-list.component.ts` with signals

### 2. $watch Patterns → Effects

```javascript
// WATCH EXPRESSION
$scope.$watch('searchQuery', function(newVal, oldVal) {
    if (newVal !== oldVal) {
        $scope.filteredResults = filterResults(newVal);
    }
});

// DEEP WATCH
$scope.$watch('formData', function(newVal) {
    $scope.isFormDirty = true;
}, true);

// WATCH COLLECTION
$scope.$watchCollection('items', function(newItems) {
    $scope.totalPrice = calculateTotal(newItems);
});
```

**Migrate to:** `effect()` and `computed()` signals

### 3. Service/Factory Patterns → Injectable Services

```javascript
// FACTORY PATTERN
app.factory('CustomerService', ['$http', '$q', function($http, $q) {
    var service = {};

    service.getAll = function() {
        return $http.get('/api/customers');  // → HttpClient.get<Customer[]>()
    };

    service.create = function(data) {
        return $http.post('/api/customers', data); // → HttpClient.post<Customer>()
    };

    return service;
}]);

// SERVICE PATTERN (constructor-based)
app.service('AuthService', ['$http', '$window', function($http, $window) {
    this.login = function(credentials) { ... };
    this.getToken = function() {
        return $window.localStorage.getItem('token'); // → localStorage directly
    };
}]);
```

**Migrate to:** `@Injectable({ providedIn: 'root' })` with `HttpClient`

### 4. Directive Patterns → Standalone Components

```javascript
// ELEMENT DIRECTIVE (component-like)
app.directive('customerCard', function() {
    return {
        restrict: 'E',
        scope: {
            customer: '=',     // → input(required<Customer>())
            onSelect: '&'      // → output<Customer>()
        },
        templateUrl: 'customer-card.html',
        link: function(scope, element, attrs) {
            // DOM manipulation → remove, use signals
            element.on('click', function() { ... }); // → (click) binding
        }
    };
});

// ATTRIBUTE DIRECTIVE (behavior)
app.directive('autoFocus', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            $timeout(function() {
                element[0].focus();  // → Angular Directive with ElementRef
            });
        }
    };
});
```

**Migrate to:** Standalone components or Angular directives

### 5. Filter Patterns → Pipes

```javascript
// CUSTOM FILTER
app.filter('capitalize', function() {
    return function(input) {
        if (!input) return '';
        return input.charAt(0).toUpperCase() + input.slice(1);
    };
});

// FILTER WITH DI
app.filter('currencyFormat', ['$locale', function($locale) {
    return function(amount, symbol) {
        return symbol + amount.toFixed(2);
    };
}]);
```

**Migrate to:** `@Pipe({ name: 'capitalize', standalone: true })`

### 6. Routing Patterns → Angular Router

```javascript
// $routeProvider (ngRoute)
app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/customers', {
            templateUrl: 'customers.html',
            controller: 'CustomerListCtrl',
            resolve: {
                customers: ['CustomerService', function(svc) {
                    return svc.getAll();
                }]
            }
        })
        .when('/customers/:id', {
            templateUrl: 'customer-detail.html',
            controller: 'CustomerDetailCtrl'
        })
        .otherwise({ redirectTo: '/dashboard' });
}]);

// ui-router (states)
app.config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('customers', {
                url: '/customers',
                templateUrl: 'customers.html',
                controller: 'CustomerListCtrl as vm'
            })
            .state('customers.detail', {
                url: '/:id',
                templateUrl: 'customer-detail.html',
                controller: 'CustomerDetailCtrl as vm'
            });
        $urlRouterProvider.otherwise('/dashboard');
    }
]);
```

**Migrate to:** `app.routes.ts` with lazy-loaded standalone components

### 7. Event Communication Patterns → Services/Signals

```javascript
// $broadcast / $emit / $on (event bus)
// Parent → Children
$scope.$broadcast('user:updated', userData);

// Child → Parent
$scope.$emit('item:selected', item);

// Listener
$scope.$on('user:updated', function(event, data) {
    $scope.currentUser = data;
});

// $rootScope as global event bus
$rootScope.$broadcast('notification', { message: 'Saved!' });
```

**Migrate to:** Shared services with signals, or `@Output()` for parent-child

---

## 🎯 Migration Classification Matrix

### Early Extraction Candidates ✅
| Pattern | Example | Why Early |
|---------|---------|-----------|
| Constants/Values | `app.constant('API_URL', ...)` | Direct translation |
| Pure filters | `capitalize`, `truncate` | Stateless, no DI |
| Utility services | `DateUtils`, `StringHelpers` | No framework dependency |
| Simple components (1.5+) | Already component-based | Closest to Angular |

### Standard Migration ⚠️
| Pattern | Example | Why Standard |
|---------|---------|-------------|
| CRUD controllers | List/Detail/Edit views | Well-defined patterns |
| $http services | REST API wrappers | Direct HttpClient mapping |
| Form controllers | Create/Edit forms | ReactiveFormsModule mapping |
| ngRoute/ui-router | Route definitions | Angular Router mapping |

### Complex Migration 🔴
| Pattern | Example | Why Complex |
|---------|---------|-------------|
| Heavy $watch usage | Multiple deep watchers | Needs careful signal mapping |
| $rootScope abuse | Global state via events | Needs shared service refactor |
| jQuery DOM manipulation | `element.find()`, plugins | Needs complete rewrite |
| Dynamic templates | `$compile`, `$templateCache` | No direct equivalent |
| Inline `link` functions | Complex directive logic | Needs lifecycle mapping |

---

## ⚡ Quick Reference: AngularJS → Modern Angular Mapping

### Core Concepts
| AngularJS (1.x) | Modern Angular (21+) | Migration Path |
|------------------|----------------------|----------------|
| `angular.module()` | Standalone components | Remove modules entirely |
| `.controller()` | `@Component` | Component per controller |
| `$scope` | `signal()` | State refactor |
| `$scope.$watch()` | `effect()` / `computed()` | Reactive refactor |
| `$scope.$apply()` | Remove | Zoneless handles it |
| `$scope.$digest()` | Remove | Zoneless handles it |
| `$scope.$broadcast/$emit` | Service + signal | Event bus refactor |
| `$rootScope` | Shared service | DI refactor |
| `.factory()` / `.service()` | `@Injectable()` | DI refactor |
| `.directive()` (element) | `@Component` (standalone) | Component refactor |
| `.directive()` (attribute) | `@Directive` | Behavioral directive |
| `.filter()` | `@Pipe` (standalone) | Pipe refactor |
| `.config()` routes | `app.routes.ts` | Router migration |
| `.run()` | `APP_INITIALIZER` | Bootstrap refactor |
| `.constant()` / `.value()` | `InjectionToken` or const | Config refactor |
| `ng-repeat` | `@for (item of items)` | Template syntax |
| `ng-if` | `@if (condition)` | Template syntax |
| `ng-show`/`ng-hide` | `@if` or `[hidden]` | Template syntax |
| `ng-click` | `(click)` | Event binding |
| `ng-model` | `formControl` (Reactive) | Forms refactor |
| `ng-class` | `[ngClass]` | Direct map |
| `ng-style` | `[ngStyle]` | Direct map |
| `ng-include` | Component composition | Template refactor |
| `ng-transclude` | `<ng-content>` | Content projection |
| `$http` | `HttpClient` | HTTP refactor |
| `$http` interceptors | `HttpInterceptorFn` | Functional interceptor |
| `$q` / `$q.defer()` | Native `Promise` / RxJS | Async refactor |
| `$timeout` | `setTimeout` or `effect()` | Timer refactor |
| `$interval` | `setInterval` or RxJS | Timer refactor |
| `$window` | Direct `window` / inject | Platform refactor |
| `$document` | Direct `document` / inject | Platform refactor |
| `$location` | `Router` | Navigation refactor |
| `$anchorScroll` | `ViewportScroller` | Scroll refactor |
| `$cookies` | Direct `document.cookie` | Cookie refactor |

### Template Syntax Migration
| AngularJS | Modern Angular | Notes |
|-----------|---------------|-------|
| `ng-repeat="item in items"` | `@for (item of items(); track item.id)` | Must add `track` |
| `ng-repeat="item in items \| filter:query"` | `@for (item of filteredItems(); track item.id)` | Use `computed()` signal |
| `ng-if="condition"` | `@if (condition())` | Signal call syntax |
| `ng-show="visible"` | `@if (visible())` or `[class.hidden]` | Prefer `@if` |
| `ng-switch` | `@switch (value())` | Block syntax |
| `ng-bind="::expr"` | `{{ expr() }}` | One-time bind → signal |
| `ng-cloak` | Remove | Not needed |
| `{{ expr \| filter }}` | `{{ expr() \| pipe }}` | Signal + standalone pipe |

---

## 📊 Coupling Analysis Queries

### Find Module Dependencies
```bash
# Find all angular.module declarations
grep -rn "angular\.module(" *.js

# Find all dependency injections
grep -rn "\$inject\|function(" *.js | grep "\$"

# Find all $scope usage
grep -rn "\$scope\." *.js

# Find all $rootScope usage
grep -rn "\$rootScope" *.js

# Find all jQuery usage
grep -rn "angular\.element\|jQuery\|\$(" *.js

# Find all $watch usage
grep -rn "\$watch\|\$watchCollection\|\$watchGroup" *.js
```

### Dependency Matrix Template
```markdown
| Source | Target | Type | Count | Risk |
|--------|--------|------|-------|------|
| CustomerCtrl | CustomerService | DI | 5 | Low |
| CustomerCtrl | $rootScope | Event | 3 | High |
| OrderDirective | jQuery | DOM | 8 | High |
```

---

## 🛠️ Analysis Script Usage

```bash
# Comprehensive scan with migration analysis
python .agent/scripts/angularjs_comprehensive_scanner.py "source_dir" -o analysis.json --pretty

# Extract route configuration
python .agent/scripts/angularjs_route_extractor.py "source_dir" -o routes.json

# Extract legacy patterns for migration mapping
python .agent/scripts/angularjs_pattern_extractor.py "source_dir" -o patterns.json
```
