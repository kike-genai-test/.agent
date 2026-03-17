#!/usr/bin/env python3
"""
AngularJS Dead Code Detector
==============================
Detects unused code in AngularJS codebases including controllers, services,
directives, filters, and $scope variables that are declared but never referenced.
Outputs structured JSON with dead code items and confidence levels.
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

CACHE_FILE = ".angularjs_deadcode_cache.json"

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ============================================================================
# PARSING PATTERNS
# ============================================================================

PATTERNS = {
    # Declarations
    "controller_decl": re.compile(r"\.\s*controller\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "service_decl": re.compile(r"\.\s*service\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "factory_decl": re.compile(r"\.\s*factory\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "directive_decl": re.compile(r"\.\s*directive\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "component_decl": re.compile(r"\.\s*component\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "filter_decl": re.compile(r"\.\s*filter\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),

    # Scope variable assignments
    "scope_assignment": re.compile(r"\$scope\s*\.\s*(\w+)\s*=", re.MULTILINE),

    # Route/state references to controllers
    "route_controller": re.compile(r"controller\s*:\s*['\"]([^'\"]+)['\"]", re.MULTILINE),

    # Template references
    "template_url": re.compile(r"templateUrl\s*:\s*['\"]([^'\"]+)['\"]", re.MULTILINE),

    # ng-controller in templates
    "ng_controller": re.compile(r"ng-controller\s*=\s*['\"]([^'\"]+)['\"]", re.MULTILINE),

    # Injection references (service/factory names in inject arrays or function params)
    "inject_array": re.compile(r"\$inject\s*=\s*\[([^\]]*)\]", re.MULTILINE),
    "inline_injection": re.compile(r"\[\s*((?:['\"][^'\"]+['\"],?\s*)+)function\s*\(", re.MULTILINE),
    "function_params": re.compile(r"function\s*\(([^)]*)\)", re.MULTILINE),

    # Directive usage in templates (camelCase -> kebab-case)
    "html_tags": re.compile(r"<([\w-]+)", re.MULTILINE),
    "html_attrs": re.compile(r"\s([\w-]+)\s*=", re.MULTILINE),

    # Filter usage in templates  {{ expr | filterName }}
    "filter_usage_template": re.compile(r"\|\s*(\w+)", re.MULTILINE),
    # Filter usage in JS  $filter('name')
    "filter_usage_js": re.compile(r"\$filter\s*\(\s*['\"](\w+)['\"]", re.MULTILINE),

    # Scope variable reads in templates  {{ scopeVar }} or ng-model="scopeVar"
    "template_binding": re.compile(r"\{\{\s*(\w+)", re.MULTILINE),
    "ng_model": re.compile(r"ng-model\s*=\s*['\"](\w+)", re.MULTILINE),
    "ng_bind": re.compile(r"ng-bind\s*=\s*['\"](\w+)", re.MULTILINE),
    "ng_show_hide": re.compile(r"ng-(?:show|hide|if|disabled|class)\s*=\s*['\"](\w+)", re.MULTILINE),
    "ng_repeat": re.compile(r"ng-repeat\s*=\s*['\"].*?\bin\s+(\w+)", re.MULTILINE),
    "ng_click": re.compile(r"ng-click\s*=\s*['\"](\w+)", re.MULTILINE),
}


def _camel_to_kebab(name):
    """Convert camelCase to kebab-case for directive matching."""
    s1 = re.sub(r'(.)([A-Z][a-z]+)', r'\1-\2', name)
    return re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', s1).lower()


# ============================================================================
# DEAD CODE DETECTOR CLASS
# ============================================================================

class AngularJSDeadCodeDetector:
    def __init__(self, source_dir):
        self.source_dir = Path(source_dir)
        self.analysis = {
            "metadata": {
                "scan_date": datetime.now().isoformat(),
                "source_directory": str(self.source_dir),
                "scanner_version": "1.0.0",
                "scanner_type": "angularjs_dead_code"
            },
            "summary": {},
            "dead_code": [],
            "unused_controllers": [],
            "unused_services": [],
            "unused_directives": [],
            "unused_filters": [],
            "unused_scope_vars": []
        }

    def scan(self):
        """Main entry point."""
        print(f"Scanning: {self.source_dir}")

        current_hash = self._calculate_source_hash()
        if self._load_from_cache(current_hash):
            return self.analysis

        js_files, html_files = self._discover_files()
        print(f"Found {len(js_files)} JS files, {len(html_files)} HTML files")

        # Read all content
        js_contents = {}
        for fi in js_files:
            c = self._read_file(fi["path"])
            if c:
                js_contents[fi["relative_path"]] = c

        html_contents = {}
        for fi in html_files:
            c = self._read_file(fi["path"])
            if c:
                html_contents[fi["relative_path"]] = c

        all_js_text = "\n".join(js_contents.values())
        all_html_text = "\n".join(html_contents.values())
        all_text = all_js_text + "\n" + all_html_text

        # 1. Detect unused controllers
        self._detect_unused_controllers(js_contents, all_html_text, all_js_text)

        # 2. Detect unused services/factories
        self._detect_unused_services(js_contents, all_js_text)

        # 3. Detect unused directives
        self._detect_unused_directives(js_contents, all_html_text, all_text)

        # 4. Detect unused filters
        self._detect_unused_filters(js_contents, all_html_text, all_js_text)

        # 5. Detect unused $scope variables
        self._detect_unused_scope_vars(js_contents, html_contents)

        # Consolidate
        self.analysis["dead_code"] = (
            self.analysis["unused_controllers"] +
            self.analysis["unused_services"] +
            self.analysis["unused_directives"] +
            self.analysis["unused_filters"] +
            self.analysis["unused_scope_vars"]
        )

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
                if fn.endswith((".js", ".html")):
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

    def _discover_files(self):
        skip_dirs = {"node_modules", "bower_components", ".git", "dist", "build", "coverage", ".tmp"}
        js_files = []
        html_files = []
        for root, dirs, files in os.walk(self.source_dir):
            dirs[:] = [d for d in dirs if d not in skip_dirs]
            for fn in files:
                fp = Path(root) / fn
                try:
                    size = fp.stat().st_size
                except OSError:
                    continue
                info = {
                    "name": fn,
                    "path": str(fp),
                    "relative_path": str(fp.relative_to(self.source_dir)),
                    "size_bytes": size
                }
                if fn.endswith(".js"):
                    js_files.append(info)
                elif fn.endswith(".html"):
                    html_files.append(info)
        return js_files, html_files

    def _read_file(self, filepath):
        encodings = ['utf-8', 'latin1', 'cp1252', 'iso-8859-1']
        for enc in encodings:
            try:
                with open(filepath, 'r', encoding=enc) as f:
                    return f.read()
            except (UnicodeDecodeError, FileNotFoundError):
                continue
        return None

    def _detect_unused_controllers(self, js_contents, all_html_text, all_js_text):
        """Find controllers declared but never referenced in templates or routes."""
        declared = {}
        for rel, content in js_contents.items():
            for m in PATTERNS["controller_decl"].finditer(content):
                declared[m.group(1)] = rel

        # References: ng-controller in HTML, controller: 'Name' in JS routes
        html_refs = set(PATTERNS["ng_controller"].findall(all_html_text))
        # Also match "SomeCtrl as vm" patterns
        for ref in list(html_refs):
            html_refs.add(ref.split(" ")[0].strip())

        js_refs = set(PATTERNS["route_controller"].findall(all_js_text))

        all_refs = html_refs | js_refs

        for name, file in declared.items():
            if name not in all_refs:
                # Check if the name appears as a string anywhere else
                appears_elsewhere = False
                for rel2, content2 in js_contents.items():
                    if rel2 == file:
                        continue
                    if name in content2:
                        appears_elsewhere = True
                        break
                confidence = "HIGH" if not appears_elsewhere else "MEDIUM"
                self.analysis["unused_controllers"].append({
                    "type": "controller",
                    "name": name,
                    "declared_in": file,
                    "confidence": confidence,
                    "reason": "Controller declared but not found in ng-controller or route config"
                })

    def _detect_unused_services(self, js_contents, all_js_text):
        """Find services/factories that are never injected anywhere."""
        declared = {}
        for rel, content in js_contents.items():
            for m in PATTERNS["service_decl"].finditer(content):
                declared[m.group(1)] = {"file": rel, "type": "service"}
            for m in PATTERNS["factory_decl"].finditer(content):
                declared[m.group(1)] = {"file": rel, "type": "factory"}

        # Collect all injection references
        inject_refs = set()
        for m in PATTERNS["inject_array"].finditer(all_js_text):
            for dep in m.group(1).split(","):
                dep = dep.strip().strip("'\"")
                if dep:
                    inject_refs.add(dep)
        for m in PATTERNS["inline_injection"].finditer(all_js_text):
            for dep in m.group(1).split(","):
                dep = dep.strip().strip("'\"")
                if dep:
                    inject_refs.add(dep)
        for m in PATTERNS["function_params"].finditer(all_js_text):
            for param in m.group(1).split(","):
                param = param.strip()
                if param:
                    inject_refs.add(param)

        for name, info in declared.items():
            if name not in inject_refs:
                # Additional check: does the name appear as a string ref elsewhere
                ref_count = all_js_text.count(name)
                # At least the declaration itself counts as 1
                confidence = "HIGH" if ref_count <= 2 else "LOW"
                self.analysis["unused_services"].append({
                    "type": info["type"],
                    "name": name,
                    "declared_in": info["file"],
                    "confidence": confidence,
                    "reason": f"{info['type'].capitalize()} declared but not found in any injection"
                })

    def _detect_unused_directives(self, js_contents, all_html_text, all_text):
        """Find directives never used in templates."""
        declared = {}
        for rel, content in js_contents.items():
            for m in PATTERNS["directive_decl"].finditer(content):
                declared[m.group(1)] = rel

        # Directives can appear as elements or attributes in kebab-case
        all_tags = set(PATTERNS["html_tags"].findall(all_html_text))
        all_attrs = set(PATTERNS["html_attrs"].findall(all_html_text))
        all_html_tokens = all_tags | all_attrs

        for name, file in declared.items():
            kebab = _camel_to_kebab(name)
            found = kebab in all_html_tokens or name in all_html_tokens
            if not found:
                # Check if the kebab name appears anywhere in HTML
                found = kebab in all_html_text
            if not found:
                confidence = "HIGH" if name not in all_text else "MEDIUM"
                self.analysis["unused_directives"].append({
                    "type": "directive",
                    "name": name,
                    "kebab_name": kebab,
                    "declared_in": file,
                    "confidence": confidence,
                    "reason": "Directive declared but not found in any template (as element or attribute)"
                })

    def _detect_unused_filters(self, js_contents, all_html_text, all_js_text):
        """Find filters never used in templates or JS."""
        declared = {}
        for rel, content in js_contents.items():
            for m in PATTERNS["filter_decl"].finditer(content):
                declared[m.group(1)] = rel

        # Filter usage: {{ expr | filterName }} in HTML, $filter('name') in JS
        html_filter_refs = set(PATTERNS["filter_usage_template"].findall(all_html_text))
        js_filter_refs = set(PATTERNS["filter_usage_js"].findall(all_js_text))
        all_filter_refs = html_filter_refs | js_filter_refs

        for name, file in declared.items():
            if name not in all_filter_refs:
                confidence = "HIGH"
                self.analysis["unused_filters"].append({
                    "type": "filter",
                    "name": name,
                    "declared_in": file,
                    "confidence": confidence,
                    "reason": "Filter declared but not used in any template or $filter() call"
                })

    def _detect_unused_scope_vars(self, js_contents, html_contents):
        """Find $scope variables set in controllers but never read in templates."""
        # Collect all scope vars per file
        scope_vars_by_file = {}
        for rel, content in js_contents.items():
            vars_found = set(PATTERNS["scope_assignment"].findall(content))
            if vars_found:
                scope_vars_by_file[rel] = vars_found

        # Collect all variable references in HTML templates
        all_html_refs = set()
        for rel, content in html_contents.items():
            all_html_refs.update(PATTERNS["template_binding"].findall(content))
            all_html_refs.update(PATTERNS["ng_model"].findall(content))
            all_html_refs.update(PATTERNS["ng_bind"].findall(content))
            all_html_refs.update(PATTERNS["ng_show_hide"].findall(content))
            all_html_refs.update(PATTERNS["ng_repeat"].findall(content))
            all_html_refs.update(PATTERNS["ng_click"].findall(content))

        # Also check all HTML text for any occurrence of the variable name
        all_html_text = "\n".join(html_contents.values())

        for rel, scope_vars in scope_vars_by_file.items():
            for var in scope_vars:
                # Skip common framework vars
                if var.startswith("$") or var in ("this", "self"):
                    continue
                if var not in all_html_refs and var not in all_html_text:
                    self.analysis["unused_scope_vars"].append({
                        "type": "scope_variable",
                        "name": f"$scope.{var}",
                        "declared_in": rel,
                        "confidence": "MEDIUM",
                        "reason": f"$scope.{var} assigned but never referenced in any template"
                    })

    def _generate_summary(self):
        self.analysis["summary"] = {
            "total_dead_code_items": len(self.analysis["dead_code"]),
            "unused_controllers": len(self.analysis["unused_controllers"]),
            "unused_services": len(self.analysis["unused_services"]),
            "unused_directives": len(self.analysis["unused_directives"]),
            "unused_filters": len(self.analysis["unused_filters"]),
            "unused_scope_vars": len(self.analysis["unused_scope_vars"]),
            "high_confidence_items": len([d for d in self.analysis["dead_code"] if d["confidence"] == "HIGH"]),
            "medium_confidence_items": len([d for d in self.analysis["dead_code"] if d["confidence"] == "MEDIUM"]),
            "low_confidence_items": len([d for d in self.analysis["dead_code"] if d["confidence"] == "LOW"])
        }


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="AngularJS Dead Code Detector - Find unused controllers, services, directives, and filters"
    )
    parser.add_argument(
        "source_dir",
        help="Directory containing AngularJS source code"
    )
    parser.add_argument(
        "-o", "--output",
        help="Output JSON file path",
        default="angularjs_dead_code.json"
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

    detector = AngularJSDeadCodeDetector(args.source_dir)
    analysis = detector.scan()

    indent = 2 if args.pretty else None
    output_json = json.dumps(analysis, indent=indent, ensure_ascii=False)

    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(output_json)

    s = analysis["summary"]
    print(f"Analysis complete! Output: {args.output}")
    print(f"   Total dead code items: {s['total_dead_code_items']}")
    print(f"   Unused controllers: {s['unused_controllers']}")
    print(f"   Unused services: {s['unused_services']}")
    print(f"   Unused directives: {s['unused_directives']}")
    print(f"   Unused filters: {s['unused_filters']}")
    print(f"   Unused scope vars: {s['unused_scope_vars']}")
    print(f"   High confidence: {s['high_confidence_items']}")
    print(f"   Medium confidence: {s['medium_confidence_items']}")
    print(f"   Low confidence: {s['low_confidence_items']}")

    return 0


if __name__ == "__main__":
    exit(main())
