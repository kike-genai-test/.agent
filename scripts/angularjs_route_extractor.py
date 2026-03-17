#!/usr/bin/env python3
"""
AngularJS Route Extractor
===========================
Extracts route configurations from AngularJS codebases including
$routeProvider.when() (ngRoute) and $stateProvider.state() (ui-router).
Parses path/state name, templateUrl, controller, resolve blocks, and child
states, then maps them to suggested Angular Router equivalents.
Outputs structured JSON with all routes and suggested modern mapping.
"""

import os
import re
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from collections import defaultdict
import hashlib

CACHE_FILE = ".angularjs_routes_cache.json"

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ============================================================================
# PARSING PATTERNS
# ============================================================================

PATTERNS = {
    # ngRoute: $routeProvider.when('/path', { ... })
    "route_when": re.compile(
        r"\$routeProvider\s*\.\s*when\s*\(\s*['\"]([^'\"]+)['\"]\s*,\s*(\{[^}]*\})",
        re.MULTILINE | re.DOTALL
    ),
    # ngRoute: .otherwise({ ... })
    "route_otherwise": re.compile(
        r"\.otherwise\s*\(\s*(\{[^}]*\})",
        re.MULTILINE | re.DOTALL
    ),

    # ui-router: $stateProvider.state('name', { ... })
    "state_def": re.compile(
        r"\$stateProvider\s*\.\s*state\s*\(\s*['\"]([^'\"]+)['\"]\s*,\s*(\{[^}]*?\})\s*\)",
        re.MULTILINE | re.DOTALL
    ),
    # ui-router chained: .state('name', { ... })
    "state_chained": re.compile(
        r"\.\s*state\s*\(\s*['\"]([^'\"]+)['\"]\s*,\s*(\{[^}]*?\})\s*\)",
        re.MULTILINE | re.DOTALL
    ),

    # Properties inside route/state config objects
    "templateUrl": re.compile(r"templateUrl\s*:\s*['\"]([^'\"]+)['\"]"),
    "template": re.compile(r"template\s*:\s*['\"]([^'\"]+)['\"]"),
    "controller": re.compile(r"controller\s*:\s*['\"]([^'\"]+)['\"]"),
    "controllerAs": re.compile(r"controllerAs\s*:\s*['\"]([^'\"]+)['\"]"),
    "url": re.compile(r"url\s*:\s*['\"]([^'\"]+)['\"]"),
    "parent": re.compile(r"parent\s*:\s*['\"]([^'\"]+)['\"]"),
    "abstract": re.compile(r"abstract\s*:\s*true"),
    "redirectTo": re.compile(r"redirectTo\s*:\s*['\"]([^'\"]+)['\"]"),

    # Resolve block detection
    "resolve_block": re.compile(
        r"resolve\s*:\s*\{([^}]*)\}",
        re.DOTALL
    ),
    "resolve_key": re.compile(
        r"(\w+)\s*:",
        re.MULTILINE
    ),

    # Views block (ui-router named views)
    "views_block": re.compile(
        r"views\s*:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}",
        re.DOTALL
    ),
    "view_entry": re.compile(
        r"['\"]?(\w+(?:@[\w.]*)?)['\"]?\s*:\s*\{([^}]*)\}",
        re.DOTALL
    ),

    # General module/config patterns for context
    "config_block": re.compile(
        r"\.\s*config\s*\(\s*(?:\[.*?)?function\s*\(([^)]*)\)",
        re.MULTILINE | re.DOTALL
    ),
}


def _extract_config_props(config_str):
    """Extract common properties from a route/state config object string."""
    result = {}

    m = PATTERNS["templateUrl"].search(config_str)
    if m:
        result["templateUrl"] = m.group(1)

    m = PATTERNS["template"].search(config_str)
    if m:
        result["template"] = m.group(1)

    m = PATTERNS["controller"].search(config_str)
    if m:
        result["controller"] = m.group(1)

    m = PATTERNS["controllerAs"].search(config_str)
    if m:
        result["controllerAs"] = m.group(1)

    m = PATTERNS["url"].search(config_str)
    if m:
        result["url"] = m.group(1)

    m = PATTERNS["parent"].search(config_str)
    if m:
        result["parent"] = m.group(1)

    if PATTERNS["abstract"].search(config_str):
        result["abstract"] = True

    m = PATTERNS["redirectTo"].search(config_str)
    if m:
        result["redirectTo"] = m.group(1)

    # Resolve keys
    m = PATTERNS["resolve_block"].search(config_str)
    if m:
        resolve_str = m.group(1)
        resolve_keys = [km.group(1) for km in PATTERNS["resolve_key"].finditer(resolve_str)]
        result["resolve"] = resolve_keys

    # Named views
    m = PATTERNS["views_block"].search(config_str)
    if m:
        views_str = m.group(1)
        views = {}
        for vm in PATTERNS["view_entry"].finditer(views_str):
            view_name = vm.group(1)
            view_config = vm.group(2)
            view_data = {}
            tm = PATTERNS["templateUrl"].search(view_config)
            if tm:
                view_data["templateUrl"] = tm.group(1)
            cm = PATTERNS["controller"].search(view_config)
            if cm:
                view_data["controller"] = cm.group(1)
            views[view_name] = view_data
        if views:
            result["views"] = views

    return result


def _suggest_angular_route(route_type, path, config):
    """Generate a suggested Angular Router equivalent."""
    suggestion = {}

    if route_type == "ngRoute":
        suggestion["path"] = path.lstrip("/")
    elif route_type == "ui-router":
        # Convert ui-router URL params :id to Angular :id
        url = config.get("url", path)
        suggestion["path"] = url.lstrip("/")

    if config.get("redirectTo"):
        suggestion["redirectTo"] = config["redirectTo"].lstrip("/")
        suggestion["pathMatch"] = "full"
        return suggestion

    if config.get("abstract"):
        suggestion["note"] = "Abstract state - convert to parent route with <router-outlet>"

    # Component suggestion
    ctrl = config.get("controller", "")
    if ctrl:
        # Convert MyCtrl or MyController to MyComponent
        comp_name = ctrl.replace("Controller", "").replace("Ctrl", "") + "Component"
        suggestion["component"] = comp_name
    elif config.get("templateUrl"):
        suggestion["component"] = "(create component for this template)"

    if config.get("resolve"):
        suggestion["resolve"] = {
            "note": "Convert resolve functions to Angular route resolvers",
            "keys": config["resolve"]
        }

    if config.get("views"):
        suggestion["note"] = "Named views - use Angular named <router-outlet name='...'>"
        suggestion["children_or_named_outlets"] = list(config["views"].keys())

    # Children hint for dotted state names (ui-router)
    if route_type == "ui-router" and "." in path:
        parent = path.rsplit(".", 1)[0]
        suggestion["parent_state"] = parent
        suggestion["note"] = f"Child state of '{parent}' - nest under parent route's children[]"

    return suggestion


# ============================================================================
# ROUTE EXTRACTOR CLASS
# ============================================================================

class AngularJSRouteExtractor:
    def __init__(self, source_dir):
        self.source_dir = Path(source_dir)
        self.analysis = {
            "metadata": {
                "scan_date": datetime.now().isoformat(),
                "source_directory": str(self.source_dir),
                "scanner_version": "1.0.0",
                "scanner_type": "angularjs_routes"
            },
            "summary": {},
            "ng_routes": [],
            "ui_router_states": [],
            "otherwise_route": None,
            "all_routes": [],
            "route_tree": {}
        }

    def scan(self):
        """Main entry point."""
        print(f"Scanning: {self.source_dir}")

        current_hash = self._calculate_source_hash()
        if self._load_from_cache(current_hash):
            return self.analysis

        js_files = self._discover_js_files()
        print(f"Found {len(js_files)} JavaScript files")

        for fi in js_files:
            content = self._read_file(fi["path"])
            if content is None:
                continue
            self._parse_routes(fi["relative_path"], content)

        self._build_route_tree()
        self._generate_summary()

        self._save_to_cache(current_hash)
        return self.analysis

    def _calculate_source_hash(self):
        hasher = hashlib.md5()
        skip_dirs = {"node_modules", "bower_components", ".git", "dist", "build", "coverage", ".tmp"}
        entries = []
        for root, dirs, files in os.walk(self.source_dir):
            dirs[:] = [d for d in dirs if d not in skip_dirs]
            for fn in sorted(files):
                if fn.endswith(".js"):
                    fp = os.path.join(root, fn)
                    try:
                        st = os.stat(fp)
                        entries.append(f"{fn}{st.st_size}{st.st_mtime}")
                    except OSError:
                        pass
        for s in sorted(entries):
            hasher.update(s.encode('utf-8'))
        return hasher.hexdigest()

    def _load_from_cache(self, current_hash):
        cache_path = self.source_dir / CACHE_FILE
        if not cache_path.exists():
            return False
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                cached = json.load(f)
            if cached.get("source_hash") == current_hash:
                print(f"Cache hit! Loaded analysis from {CACHE_FILE}")
                self.analysis = cached["analysis"]
                return True
        except Exception as e:
            print(f"Cache read error: {e}")
        return False

    def _save_to_cache(self, current_hash):
        try:
            cache_path = self.source_dir / CACHE_FILE
            data = {
                "source_hash": current_hash,
                "timestamp": datetime.now().isoformat(),
                "analysis": self.analysis
            }
            with open(cache_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False)
            print(f"Analysis cached to {CACHE_FILE}")
        except Exception as e:
            print(f"Cache write error: {e}")

    def _discover_js_files(self):
        skip_dirs = {"node_modules", "bower_components", ".git", "dist", "build", "coverage", ".tmp"}
        result = []
        for root, dirs, files in os.walk(self.source_dir):
            dirs[:] = [d for d in dirs if d not in skip_dirs]
            for fn in files:
                if fn.endswith(".js"):
                    fp = Path(root) / fn
                    try:
                        size = fp.stat().st_size
                    except OSError:
                        continue
                    result.append({
                        "name": fn,
                        "path": str(fp),
                        "relative_path": str(fp.relative_to(self.source_dir)),
                        "size_bytes": size
                    })
        return result

    def _read_file(self, filepath):
        encodings = ['utf-8', 'latin1', 'cp1252', 'iso-8859-1']
        for enc in encodings:
            try:
                with open(filepath, 'r', encoding=enc) as f:
                    return f.read()
            except (UnicodeDecodeError, FileNotFoundError):
                continue
        return None

    def _parse_routes(self, rel_path, content):
        """Parse both ngRoute and ui-router configurations."""

        # ngRoute: $routeProvider.when()
        for m in PATTERNS["route_when"].finditer(content):
            path = m.group(1)
            config_str = m.group(2)
            config = _extract_config_props(config_str)
            suggestion = _suggest_angular_route("ngRoute", path, config)

            route_entry = {
                "type": "ngRoute",
                "path": path,
                "config": config,
                "file": rel_path,
                "angular_equivalent": suggestion
            }
            self.analysis["ng_routes"].append(route_entry)
            self.analysis["all_routes"].append(route_entry)

        # ngRoute: .otherwise()
        for m in PATTERNS["route_otherwise"].finditer(content):
            config_str = m.group(1)
            config = _extract_config_props(config_str)
            redirect = config.get("redirectTo", "/")
            self.analysis["otherwise_route"] = {
                "type": "ngRoute_otherwise",
                "config": config,
                "file": rel_path,
                "angular_equivalent": {
                    "path": "**",
                    "redirectTo": redirect.lstrip("/"),
                    "pathMatch": "full"
                }
            }

        # ui-router: $stateProvider.state() and chained .state()
        seen_states = set()
        for pattern_key in ["state_def", "state_chained"]:
            for m in PATTERNS[pattern_key].finditer(content):
                state_name = m.group(1)
                if state_name in seen_states:
                    continue
                seen_states.add(state_name)

                config_str = m.group(2)
                config = _extract_config_props(config_str)
                suggestion = _suggest_angular_route("ui-router", state_name, config)

                state_entry = {
                    "type": "ui-router",
                    "state": state_name,
                    "path": config.get("url", ""),
                    "config": config,
                    "file": rel_path,
                    "angular_equivalent": suggestion
                }
                self.analysis["ui_router_states"].append(state_entry)
                self.analysis["all_routes"].append(state_entry)

    def _build_route_tree(self):
        """Build a hierarchical route tree for ui-router states."""
        tree = {}
        for state in self.analysis["ui_router_states"]:
            name = state["state"]
            parts = name.split(".")
            current = tree
            for i, part in enumerate(parts):
                if part not in current:
                    current[part] = {"_state": None, "_children": {}}
                if i == len(parts) - 1:
                    current[part]["_state"] = {
                        "name": name,
                        "url": state.get("path", ""),
                        "controller": state["config"].get("controller", ""),
                        "templateUrl": state["config"].get("templateUrl", ""),
                        "abstract": state["config"].get("abstract", False)
                    }
                current = current[part]["_children"]
        self.analysis["route_tree"] = tree

    def _generate_summary(self):
        ng_count = len(self.analysis["ng_routes"])
        ui_count = len(self.analysis["ui_router_states"])
        has_otherwise = self.analysis["otherwise_route"] is not None

        # Count abstract states
        abstract_count = sum(
            1 for s in self.analysis["ui_router_states"]
            if s["config"].get("abstract")
        )
        # Count states with resolve
        resolve_count = sum(
            1 for r in self.analysis["all_routes"]
            if r["config"].get("resolve")
        )
        # Count states with named views
        views_count = sum(
            1 for s in self.analysis["ui_router_states"]
            if s["config"].get("views")
        )
        # Count child states (dotted names)
        child_count = sum(
            1 for s in self.analysis["ui_router_states"]
            if "." in s["state"]
        )

        self.analysis["summary"] = {
            "total_routes": ng_count + ui_count,
            "ngRoute_count": ng_count,
            "ui_router_count": ui_count,
            "has_otherwise": has_otherwise,
            "abstract_states": abstract_count,
            "routes_with_resolve": resolve_count,
            "states_with_named_views": views_count,
            "child_states": child_count,
            "routing_library": (
                "both" if ng_count > 0 and ui_count > 0
                else "ngRoute" if ng_count > 0
                else "ui-router" if ui_count > 0
                else "none"
            )
        }


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="AngularJS Route Extractor - Parse ngRoute and ui-router configurations"
    )
    parser.add_argument(
        "source_dir",
        help="Directory containing AngularJS source code"
    )
    parser.add_argument(
        "-o", "--output",
        help="Output JSON file path",
        default="angularjs_routes.json"
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty print JSON output"
    )

    args = parser.parse_args()

    if not os.path.isdir(args.source_dir):
        print(f"Error: Directory not found: {args.source_dir}")
        return 1

    extractor = AngularJSRouteExtractor(args.source_dir)
    analysis = extractor.scan()

    indent = 2 if args.pretty else None
    output_json = json.dumps(analysis, indent=indent, ensure_ascii=False)

    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(output_json)

    s = analysis["summary"]
    print(f"Analysis complete! Output: {args.output}")
    print(f"   Total routes: {s['total_routes']}")
    print(f"   ngRoute routes: {s['ngRoute_count']}")
    print(f"   ui-router states: {s['ui_router_count']}")
    print(f"   Routing library: {s['routing_library']}")
    print(f"   Abstract states: {s['abstract_states']}")
    print(f"   Routes with resolve: {s['routes_with_resolve']}")
    print(f"   Named view states: {s['states_with_named_views']}")
    print(f"   Child states: {s['child_states']}")
    print(f"   Has otherwise/default: {s['has_otherwise']}")

    return 0


if __name__ == "__main__":
    exit(main())
