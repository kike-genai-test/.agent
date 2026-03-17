#!/usr/bin/env python3
"""
AngularJS Comprehensive Scanner
================================
Expert-level analyzer for AngularJS codebases.
Discovers and catalogs ALL AngularJS artifacts including controllers,
services, directives, components, filters, configs, templates, and tests.
Generates structured JSON output for report generation.
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

CACHE_FILE = ".angularjs_scanner_cache.json"

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ============================================================================
# FILE TYPE DEFINITIONS
# ============================================================================

FILE_CATEGORIES = {
    "controllers": {
        "extensions": [],
        "patterns": [".controller.js"],
        "description": "AngularJS controller files",
        "icon": "C"
    },
    "services": {
        "extensions": [],
        "patterns": [".service.js", ".factory.js"],
        "description": "AngularJS service and factory files",
        "icon": "S"
    },
    "directives": {
        "extensions": [],
        "patterns": [".directive.js"],
        "description": "AngularJS directive files",
        "icon": "D"
    },
    "components": {
        "extensions": [],
        "patterns": [".component.js"],
        "description": "AngularJS component files",
        "icon": "K"
    },
    "filters": {
        "extensions": [],
        "patterns": [".filter.js"],
        "description": "AngularJS filter files",
        "icon": "F"
    },
    "configs": {
        "extensions": [],
        "patterns": [".config.js"],
        "description": "AngularJS config files",
        "icon": "G"
    },
    "templates": {
        "extensions": [".html"],
        "patterns": [".tpl.html"],
        "description": "HTML templates",
        "icon": "T"
    },
    "styles": {
        "extensions": [".css", ".scss", ".less"],
        "patterns": [],
        "description": "Stylesheets (CSS, SCSS, LESS)",
        "icon": "Y"
    },
    "tests": {
        "extensions": [],
        "patterns": [".spec.js"],
        "description": "Test specification files",
        "icon": "X"
    },
    "javascript": {
        "extensions": [".js"],
        "patterns": [],
        "description": "Other JavaScript files",
        "icon": "J"
    }
}

# ============================================================================
# ANGULARJS PARSING PATTERNS
# ============================================================================

PATTERNS = {
    # Module declarations
    "module_decl": re.compile(
        r"angular\s*\.\s*module\s*\(\s*['\"]([^'\"]+)['\"]\s*,\s*\[([^\]]*)\]",
        re.MULTILINE
    ),
    "module_ref": re.compile(
        r"angular\s*\.\s*module\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",
        re.MULTILINE
    ),

    # Artifact registrations
    "controller": re.compile(
        r"\.\s*controller\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),
    "service": re.compile(
        r"\.\s*service\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),
    "factory": re.compile(
        r"\.\s*factory\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),
    "directive": re.compile(
        r"\.\s*directive\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),
    "component": re.compile(
        r"\.\s*component\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),
    "filter": re.compile(
        r"\.\s*filter\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),
    "config_block": re.compile(
        r"\.\s*config\s*\(",
        re.MULTILINE
    ),
    "run_block": re.compile(
        r"\.\s*run\s*\(",
        re.MULTILINE
    ),
    "constant": re.compile(
        r"\.\s*constant\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),
    "value": re.compile(
        r"\.\s*value\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),
    "provider": re.compile(
        r"\.\s*provider\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),

    # Dependency injection
    "inject_annotation": re.compile(
        r"(\w+)\s*\.\s*\$inject\s*=\s*\[([^\]]*)\]",
        re.MULTILINE
    ),
    "inline_inject": re.compile(
        r"\[\s*((?:['\"][^'\"]+['\"],?\s*)+)function\s*\(",
        re.MULTILINE
    ),

    # Scope usage
    "scope_assignment": re.compile(
        r"\$scope\s*\.\s*(\w+)\s*=",
        re.MULTILINE
    ),
    "scope_watch": re.compile(
        r"\$scope\s*\.\s*\$watch\s*\(",
        re.MULTILINE
    ),
    "scope_on": re.compile(
        r"\$scope\s*\.\s*\$on\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),
    "scope_emit": re.compile(
        r"\$scope\s*\.\s*\$emit\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),
    "scope_broadcast": re.compile(
        r"\$scope\s*\.\s*\$broadcast\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),

    # Template references
    "template_url": re.compile(
        r"templateUrl\s*:\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),
    "template_inline": re.compile(
        r"template\s*:\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),

    # rootScope
    "rootscope_usage": re.compile(
        r"\$rootScope",
        re.MULTILINE
    ),

    # HTTP calls
    "http_call": re.compile(
        r"\$http\s*\.\s*(get|post|put|delete|patch|head|jsonp)\s*\(",
        re.MULTILINE | re.IGNORECASE
    ),
    "http_generic": re.compile(
        r"\$http\s*\(",
        re.MULTILINE
    ),

    # Resource/REST
    "resource_usage": re.compile(
        r"\$resource\s*\(",
        re.MULTILINE
    ),

    # jQuery usage
    "jquery_usage": re.compile(
        r"(?:angular\s*\.\s*element|\$\s*\(|jQuery\s*\()",
        re.MULTILINE
    ),

    # Promise usage
    "q_usage": re.compile(
        r"\$q\b",
        re.MULTILINE
    ),

    # Timeout/Interval
    "timeout_usage": re.compile(
        r"\$timeout\s*\(",
        re.MULTILINE
    ),
    "interval_usage": re.compile(
        r"\$interval\s*\(",
        re.MULTILINE
    ),

    # Route patterns
    "route_when": re.compile(
        r"\$routeProvider\s*\.\s*when\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),
    "state_def": re.compile(
        r"\$stateProvider\s*\.\s*state\s*\(\s*['\"]([^'\"]+)['\"]",
        re.MULTILINE
    ),

    # Directive usage in templates
    "ng_directive_usage": re.compile(
        r"(?:ng-|data-ng-)(\w[\w-]*)",
        re.MULTILINE
    ),
    "custom_directive_usage": re.compile(
        r"<([\w-]+)",
        re.MULTILINE
    ),
}

# ============================================================================
# SCANNER CLASS
# ============================================================================

class AngularJSComprehensiveScanner:
    def __init__(self, source_dir):
        self.source_dir = Path(source_dir)
        self.files = defaultdict(list)
        self.analysis = {
            "metadata": {
                "scan_date": datetime.now().isoformat(),
                "source_directory": str(self.source_dir),
                "scanner_version": "1.0.0",
                "scanner_type": "angularjs"
            },
            "summary": {},
            "inventory": {},
            "modules": [],
            "controllers": [],
            "services": [],
            "directives": [],
            "components": [],
            "filters": [],
            "constants": [],
            "values": [],
            "providers": [],
            "config_blocks": [],
            "run_blocks": [],
            "dependencies": [],
            "template_refs": [],
            "risks": []
        }

    def scan(self):
        """Main entry point for scanning."""
        print(f"Scanning: {self.source_dir}")

        # Step 1: Discover all files
        self._discover_files()

        # Check cache
        current_hash = self._calculate_source_hash()
        if self._load_from_cache(current_hash):
            return self.analysis

        # Step 2: Parse JS files for AngularJS artifacts
        self._parse_js_files()

        # Step 3: Parse template files
        self._parse_templates()

        # Step 4: Generate summary
        self._generate_summary()

        # Step 5: Risk assessment
        self._assess_risks()

        # Save cache
        self._save_to_cache(current_hash)

        return self.analysis

    def _calculate_source_hash(self):
        """Calculate a hash of all source files."""
        hasher = hashlib.md5()
        all_files = []
        for cat_files in self.files.values():
            all_files.extend(cat_files)
        all_files.sort(key=lambda x: x["path"])
        for f in all_files:
            s = f"{f['name']}{f['size_bytes']}{os.path.getmtime(f['path'])}"
            hasher.update(s.encode('utf-8'))
        return hasher.hexdigest()

    def _load_from_cache(self, current_hash):
        """Try to load analysis from cache."""
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
        """Save analysis to cache."""
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

    def _categorize_file(self, filename, ext):
        """Determine the category of a file based on name patterns and extension."""
        lower = filename.lower()
        # Check pattern-based categories first (order matters)
        for cat_name, cat_info in FILE_CATEGORIES.items():
            for pat in cat_info.get("patterns", []):
                if lower.endswith(pat):
                    return cat_name
        # Fall back to extension-based categories
        for cat_name, cat_info in FILE_CATEGORIES.items():
            if ext in cat_info.get("extensions", []):
                return cat_name
        return None

    def _discover_files(self):
        """Recursively discover all files and categorize them."""
        skip_dirs = {"node_modules", "bower_components", ".git", "dist", "build", "coverage", ".tmp"}
        for root, dirs, files in os.walk(self.source_dir):
            dirs[:] = [d for d in dirs if d not in skip_dirs]
            for filename in files:
                filepath = Path(root) / filename
                ext = filepath.suffix.lower()
                category_name = self._categorize_file(filename, ext)
                if category_name is None:
                    continue
                try:
                    size = filepath.stat().st_size
                except OSError:
                    continue
                file_info = {
                    "name": filename,
                    "path": str(filepath),
                    "relative_path": str(filepath.relative_to(self.source_dir)),
                    "extension": ext,
                    "size_bytes": size,
                    "category": category_name
                }
                self.files[category_name].append(file_info)

        # Store in inventory
        for category, files in self.files.items():
            cat_info = FILE_CATEGORIES.get(category, {"description": "Unknown", "icon": "?"})
            self.analysis["inventory"][category] = {
                "description": cat_info.get("description", "Unknown files"),
                "count": len(files),
                "files": files
            }

    def _read_file(self, filepath):
        """Read file with proper encoding handling."""
        encodings = ['utf-8', 'latin1', 'cp1252', 'iso-8859-1']
        for enc in encodings:
            try:
                with open(filepath, 'r', encoding=enc) as f:
                    return f.read()
            except (UnicodeDecodeError, FileNotFoundError):
                continue
        return None

    def _get_all_js_files(self):
        """Return all JS file infos across categories."""
        js_cats = ["controllers", "services", "directives", "components",
                    "filters", "configs", "tests", "javascript"]
        result = []
        for cat in js_cats:
            result.extend(self.files.get(cat, []))
        return result

    def _parse_js_files(self):
        """Parse all JavaScript files for AngularJS artifacts."""
        all_js = self._get_all_js_files()
        for file_info in all_js:
            content = self._read_file(file_info["path"])
            if not content:
                continue
            rel = file_info["relative_path"]

            # Module declarations
            for m in PATTERNS["module_decl"].finditer(content):
                dep_str = m.group(2)
                deps = [d.strip().strip("'\"") for d in dep_str.split(",") if d.strip().strip("'\"")]
                self.analysis["modules"].append({
                    "name": m.group(1),
                    "file": rel,
                    "dependencies": deps
                })

            # Controllers
            for m in PATTERNS["controller"].finditer(content):
                ctrl_info = {
                    "name": m.group(1),
                    "file": rel,
                    "scope_vars": [],
                    "watches": 0,
                    "injections": [],
                    "template_urls": []
                }
                # Scope assignments in file
                ctrl_info["scope_vars"] = list(set(
                    sm.group(1) for sm in PATTERNS["scope_assignment"].finditer(content)
                ))
                ctrl_info["watches"] = len(PATTERNS["scope_watch"].findall(content))
                # Template URLs
                ctrl_info["template_urls"] = [
                    tm.group(1) for tm in PATTERNS["template_url"].finditer(content)
                ]
                self.analysis["controllers"].append(ctrl_info)

            # Services
            for m in PATTERNS["service"].finditer(content):
                self.analysis["services"].append({
                    "name": m.group(1),
                    "file": rel,
                    "type": "service"
                })

            # Factories
            for m in PATTERNS["factory"].finditer(content):
                self.analysis["services"].append({
                    "name": m.group(1),
                    "file": rel,
                    "type": "factory"
                })

            # Directives
            for m in PATTERNS["directive"].finditer(content):
                dir_info = {
                    "name": m.group(1),
                    "file": rel,
                    "template_urls": [
                        tm.group(1) for tm in PATTERNS["template_url"].finditer(content)
                    ]
                }
                self.analysis["directives"].append(dir_info)

            # Components
            for m in PATTERNS["component"].finditer(content):
                comp_info = {
                    "name": m.group(1),
                    "file": rel,
                    "template_urls": [
                        tm.group(1) for tm in PATTERNS["template_url"].finditer(content)
                    ]
                }
                self.analysis["components"].append(comp_info)

            # Filters
            for m in PATTERNS["filter"].finditer(content):
                self.analysis["filters"].append({
                    "name": m.group(1),
                    "file": rel
                })

            # Constants
            for m in PATTERNS["constant"].finditer(content):
                self.analysis["constants"].append({
                    "name": m.group(1),
                    "file": rel
                })

            # Values
            for m in PATTERNS["value"].finditer(content):
                self.analysis["values"].append({
                    "name": m.group(1),
                    "file": rel
                })

            # Providers
            for m in PATTERNS["provider"].finditer(content):
                self.analysis["providers"].append({
                    "name": m.group(1),
                    "file": rel
                })

            # Config blocks
            config_count = len(PATTERNS["config_block"].findall(content))
            if config_count > 0:
                self.analysis["config_blocks"].append({
                    "file": rel,
                    "count": config_count
                })

            # Run blocks
            run_count = len(PATTERNS["run_block"].findall(content))
            if run_count > 0:
                self.analysis["run_blocks"].append({
                    "file": rel,
                    "count": run_count
                })

            # $inject annotations
            for m in PATTERNS["inject_annotation"].finditer(content):
                deps = [d.strip().strip("'\"") for d in m.group(2).split(",") if d.strip().strip("'\"")]
                self.analysis["dependencies"].append({
                    "artifact": m.group(1),
                    "file": rel,
                    "injections": deps
                })

            # Template URL references
            for m in PATTERNS["template_url"].finditer(content):
                self.analysis["template_refs"].append({
                    "url": m.group(1),
                    "file": rel
                })

    def _parse_templates(self):
        """Parse HTML template files for directive/component usage."""
        # Stored for summary; detailed template analysis can be extended
        pass

    def _generate_summary(self):
        """Generate summary statistics."""
        total_files = sum(len(files) for files in self.files.values())
        total_size = sum(
            f["size_bytes"] for files in self.files.values() for f in files
        )
        self.analysis["summary"] = {
            "total_files": total_files,
            "total_size_bytes": total_size,
            "total_size_human": self._human_size(total_size),
            "modules_count": len(self.analysis["modules"]),
            "controllers_count": len(self.analysis["controllers"]),
            "services_count": len(self.analysis["services"]),
            "directives_count": len(self.analysis["directives"]),
            "components_count": len(self.analysis["components"]),
            "filters_count": len(self.analysis["filters"]),
            "constants_count": len(self.analysis["constants"]),
            "values_count": len(self.analysis["values"]),
            "providers_count": len(self.analysis["providers"]),
            "config_blocks_count": len(self.analysis["config_blocks"]),
            "run_blocks_count": len(self.analysis["run_blocks"]),
            "template_refs_count": len(self.analysis["template_refs"]),
            "risks_count": 0,
            "categories": {
                cat: len(self.files.get(cat, []))
                for cat in FILE_CATEGORIES.keys()
            }
        }

    def _assess_risks(self):
        """Assess migration risks."""
        risks = []

        # rootScope coupling
        rootscope_files = set()
        for file_info in self._get_all_js_files():
            content = self._read_file(file_info["path"])
            if content and PATTERNS["rootscope_usage"].search(content):
                rootscope_files.add(file_info["relative_path"])
        if rootscope_files:
            risks.append({
                "level": "HIGH",
                "category": "$rootScope Coupling",
                "description": f"Found $rootScope usage in {len(rootscope_files)} files",
                "files": list(rootscope_files),
                "mitigation": "Replace with dedicated services or state management"
            })

        # jQuery/DOM manipulation
        jquery_files = set()
        for file_info in self._get_all_js_files():
            content = self._read_file(file_info["path"])
            if content and PATTERNS["jquery_usage"].search(content):
                jquery_files.add(file_info["relative_path"])
        if jquery_files:
            risks.append({
                "level": "MEDIUM",
                "category": "jQuery/DOM Manipulation",
                "description": f"Found jQuery or angular.element usage in {len(jquery_files)} files",
                "files": list(jquery_files),
                "mitigation": "Replace with Angular renderer or template bindings"
            })

        # Excessive $scope.$watch
        total_watches = sum(c.get("watches", 0) for c in self.analysis["controllers"])
        if total_watches > 20:
            risks.append({
                "level": "HIGH",
                "category": "Performance",
                "description": f"Found {total_watches} $scope.$watch calls across controllers",
                "mitigation": "Convert to computed signals, OnPush change detection, or RxJS"
            })

        # Large number of controllers without components
        ctrl_count = len(self.analysis["controllers"])
        comp_count = len(self.analysis["components"])
        if ctrl_count > 10 and comp_count == 0:
            risks.append({
                "level": "MEDIUM",
                "category": "Architecture",
                "description": f"Found {ctrl_count} controllers but no components",
                "mitigation": "Migrate to component-based architecture before upgrading"
            })

        # $q usage (custom promises)
        q_files = set()
        for file_info in self._get_all_js_files():
            content = self._read_file(file_info["path"])
            if content and PATTERNS["q_usage"].search(content):
                q_files.add(file_info["relative_path"])
        if q_files:
            risks.append({
                "level": "LOW",
                "category": "Promise Patterns",
                "description": f"Found $q usage in {len(q_files)} files",
                "files": list(q_files),
                "mitigation": "Replace with native Promises or RxJS observables"
            })

        self.analysis["risks"] = risks
        self.analysis["summary"]["risks_count"] = len(risks)

    def _human_size(self, size_bytes):
        """Convert bytes to human readable format."""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024
        return f"{size_bytes:.1f} TB"


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="AngularJS Comprehensive Scanner - Expert-level codebase analyzer"
    )
    parser.add_argument(
        "source_dir",
        help="Directory containing AngularJS source code"
    )
    parser.add_argument(
        "-o", "--output",
        help="Output JSON file path",
        default="angularjs_analysis.json"
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

    scanner = AngularJSComprehensiveScanner(args.source_dir)
    analysis = scanner.scan()

    # Output
    indent = 2 if args.pretty else None
    output_json = json.dumps(analysis, indent=indent, ensure_ascii=False)

    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(output_json)

    print(f"Analysis complete! Output: {args.output}")
    print(f"   Files: {analysis['summary']['total_files']}")
    print(f"   Modules: {analysis['summary']['modules_count']}")
    print(f"   Controllers: {analysis['summary']['controllers_count']}")
    print(f"   Services: {analysis['summary']['services_count']}")
    print(f"   Directives: {analysis['summary']['directives_count']}")
    print(f"   Components: {analysis['summary']['components_count']}")
    print(f"   Filters: {analysis['summary']['filters_count']}")
    print(f"   Risks: {analysis['summary']['risks_count']}")

    return 0


if __name__ == "__main__":
    exit(main())
