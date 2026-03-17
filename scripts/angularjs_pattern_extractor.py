#!/usr/bin/env python3
"""
AngularJS Pattern Extractor
=============================
Extracts migration-relevant patterns from AngularJS codebases and maps them
to their modern Angular equivalents. Covers $scope assignments, $watch, events,
$http, $q, $timeout/$interval, jQuery/DOM manipulation, and $rootScope access.
Outputs structured JSON with pattern type, file, line number, code snippet,
and suggested modern equivalent.
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

CACHE_FILE = ".angularjs_patterns_cache.json"

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ============================================================================
# PARSING PATTERNS
# ============================================================================

PATTERNS = {
    # $scope.X = ... assignments -> signals
    "scope_assignment": re.compile(
        r"(\$scope\s*\.\s*(\w+)\s*=\s*.+)",
        re.MULTILINE
    ),

    # $scope.$watch() -> effects / computed
    "scope_watch": re.compile(
        r"(\$scope\s*\.\s*\$watch\s*\(\s*['\"]?([^'\")\s,]+)['\"]?\s*,)",
        re.MULTILINE
    ),
    "scope_watchGroup": re.compile(
        r"(\$scope\s*\.\s*\$watchGroup\s*\(\s*\[([^\]]+)\]\s*,)",
        re.MULTILINE
    ),
    "scope_watchCollection": re.compile(
        r"(\$scope\s*\.\s*\$watchCollection\s*\(\s*['\"]?([^'\")\s,]+)['\"]?\s*,)",
        re.MULTILINE
    ),

    # $scope.$on / $emit / $broadcast -> service events or RxJS subjects
    "scope_on": re.compile(
        r"(\$scope\s*\.\s*\$on\s*\(\s*['\"]([^'\"]+)['\"])",
        re.MULTILINE
    ),
    "scope_emit": re.compile(
        r"(\$scope\s*\.\s*\$emit\s*\(\s*['\"]([^'\"]+)['\"])",
        re.MULTILINE
    ),
    "scope_broadcast": re.compile(
        r"(\$scope\s*\.\s*\$broadcast\s*\(\s*['\"]([^'\"]+)['\"])",
        re.MULTILINE
    ),
    "rootscope_on": re.compile(
        r"(\$rootScope\s*\.\s*\$on\s*\(\s*['\"]([^'\"]+)['\"])",
        re.MULTILINE
    ),
    "rootscope_emit": re.compile(
        r"(\$rootScope\s*\.\s*\$emit\s*\(\s*['\"]([^'\"]+)['\"])",
        re.MULTILINE
    ),
    "rootscope_broadcast": re.compile(
        r"(\$rootScope\s*\.\s*\$broadcast\s*\(\s*['\"]([^'\"]+)['\"])",
        re.MULTILINE
    ),

    # $http calls -> HttpClient
    "http_method": re.compile(
        r"(\$http\s*\.\s*(get|post|put|delete|patch|head|jsonp)\s*\(\s*['\"]?([^'\")\s,]+)['\"]?)",
        re.MULTILINE | re.IGNORECASE
    ),
    "http_generic": re.compile(
        r"(\$http\s*\(\s*\{[^}]*method\s*:\s*['\"](\w+)['\"])",
        re.MULTILINE | re.DOTALL
    ),

    # $resource -> HttpClient with typed models
    "resource_usage": re.compile(
        r"(\$resource\s*\(\s*['\"]([^'\"]+)['\"])",
        re.MULTILINE
    ),

    # $q usage -> native Promises / RxJS
    "q_defer": re.compile(
        r"(\$q\s*\.\s*defer\s*\(\s*\))",
        re.MULTILINE
    ),
    "q_all": re.compile(
        r"(\$q\s*\.\s*all\s*\()",
        re.MULTILINE
    ),
    "q_when": re.compile(
        r"(\$q\s*\.\s*when\s*\()",
        re.MULTILINE
    ),
    "q_resolve": re.compile(
        r"(\$q\s*\.\s*resolve\s*\()",
        re.MULTILINE
    ),
    "q_reject": re.compile(
        r"(\$q\s*\.\s*reject\s*\()",
        re.MULTILINE
    ),

    # $timeout / $interval -> native setTimeout/setInterval or RxJS timer
    "timeout_usage": re.compile(
        r"(\$timeout\s*\([^)]*\))",
        re.MULTILINE
    ),
    "interval_usage": re.compile(
        r"(\$interval\s*\([^)]*\))",
        re.MULTILINE
    ),

    # jQuery / angular.element DOM manipulation
    "angular_element": re.compile(
        r"(angular\s*\.\s*element\s*\([^)]*\)\s*\.\s*(\w+)\s*\()",
        re.MULTILINE
    ),
    "jquery_selector": re.compile(
        r"(\$\s*\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\.\s*(\w+)\s*\()",
        re.MULTILINE
    ),
    "jquery_direct": re.compile(
        r"(jQuery\s*\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\.\s*(\w+)\s*\()",
        re.MULTILINE
    ),

    # $rootScope direct property access
    "rootscope_property": re.compile(
        r"(\$rootScope\s*\.\s*(\w+)\s*=)",
        re.MULTILINE
    ),
    "rootscope_read": re.compile(
        r"(\$rootScope\s*\.\s*(\w+))(?!\s*=)",
        re.MULTILINE
    ),

    # $apply / $digest
    "scope_apply": re.compile(
        r"(\$scope\s*\.\s*\$apply\s*\()",
        re.MULTILINE
    ),
    "scope_digest": re.compile(
        r"(\$scope\s*\.\s*\$digest\s*\()",
        re.MULTILINE
    ),
    "rootscope_apply": re.compile(
        r"(\$rootScope\s*\.\s*\$apply\s*\()",
        re.MULTILINE
    ),
}

# ============================================================================
# MODERN EQUIVALENT MAPPINGS
# ============================================================================

MODERN_EQUIVALENTS = {
    "scope_assignment": "Angular signal() or component class property",
    "scope_watch": "Angular effect() or computed()",
    "scope_watchGroup": "Angular effect() watching multiple signals",
    "scope_watchCollection": "Angular effect() with deep comparison",
    "scope_on": "RxJS Subject in a shared service, or Angular event binding",
    "scope_emit": "RxJS Subject.next() in a shared service",
    "scope_broadcast": "RxJS Subject.next() in a shared service",
    "rootscope_on": "RxJS Subject in a singleton service",
    "rootscope_emit": "RxJS Subject.next() in a singleton service",
    "rootscope_broadcast": "RxJS Subject.next() in a singleton service",
    "http_method": "Angular HttpClient (e.g., this.http.get<T>(url))",
    "http_generic": "Angular HttpClient with typed request",
    "resource_usage": "Angular HttpClient with typed service methods",
    "q_defer": "Native Promise or RxJS Observable (avoid deferred anti-pattern)",
    "q_all": "Promise.all() or RxJS forkJoin()",
    "q_when": "Promise.resolve() or RxJS of()",
    "q_resolve": "Promise.resolve() or RxJS of()",
    "q_reject": "Promise.reject() or RxJS throwError()",
    "timeout_usage": "Native setTimeout() or RxJS timer()",
    "interval_usage": "Native setInterval() or RxJS interval()",
    "angular_element": "Angular Renderer2 or @ViewChild with ElementRef",
    "jquery_selector": "Angular Renderer2, @ViewChild, or template ref",
    "jquery_direct": "Angular Renderer2, @ViewChild, or template ref",
    "rootscope_property": "Shared service with BehaviorSubject or signal()",
    "rootscope_read": "Inject shared service, read from observable or signal",
    "scope_apply": "Not needed in Angular (zone.js handles change detection)",
    "scope_digest": "Not needed in Angular (zone.js handles change detection)",
    "rootscope_apply": "Not needed in Angular (zone.js handles change detection)",
}

PATTERN_CATEGORIES = {
    "scope_assignment": "Scope Binding",
    "scope_watch": "Watcher",
    "scope_watchGroup": "Watcher",
    "scope_watchCollection": "Watcher",
    "scope_on": "Event System",
    "scope_emit": "Event System",
    "scope_broadcast": "Event System",
    "rootscope_on": "Event System",
    "rootscope_emit": "Event System",
    "rootscope_broadcast": "Event System",
    "http_method": "HTTP",
    "http_generic": "HTTP",
    "resource_usage": "HTTP",
    "q_defer": "Promise",
    "q_all": "Promise",
    "q_when": "Promise",
    "q_resolve": "Promise",
    "q_reject": "Promise",
    "timeout_usage": "Timer",
    "interval_usage": "Timer",
    "angular_element": "DOM Manipulation",
    "jquery_selector": "DOM Manipulation",
    "jquery_direct": "DOM Manipulation",
    "rootscope_property": "$rootScope",
    "rootscope_read": "$rootScope",
    "scope_apply": "Digest Cycle",
    "scope_digest": "Digest Cycle",
    "rootscope_apply": "Digest Cycle",
}


# ============================================================================
# PATTERN EXTRACTOR CLASS
# ============================================================================

class AngularJSPatternExtractor:
    def __init__(self, source_dir):
        self.source_dir = Path(source_dir)
        self.analysis = {
            "metadata": {
                "scan_date": datetime.now().isoformat(),
                "source_directory": str(self.source_dir),
                "scanner_version": "1.0.0",
                "scanner_type": "angularjs_patterns"
            },
            "summary": {},
            "patterns": [],
            "by_category": defaultdict(list),
            "by_file": defaultdict(list)
        }

    def scan(self):
        """Main entry point."""
        print(f"Scanning: {self.source_dir}")

        current_hash = self._calculate_source_hash()
        if self._load_from_cache(current_hash):
            return self.analysis

        js_files = self._discover_js_files()
        print(f"Found {len(js_files)} JavaScript files")

        for file_info in js_files:
            content = self._read_file(file_info["path"])
            if content is None:
                continue
            self._extract_patterns(file_info["relative_path"], content)

        # Convert defaultdicts for JSON serialization
        self.analysis["by_category"] = dict(self.analysis["by_category"])
        self.analysis["by_file"] = dict(self.analysis["by_file"])

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

    def _get_line_number(self, content, pos):
        """Get line number for a character position."""
        return content[:pos].count("\n") + 1

    def _extract_patterns(self, rel_path, content):
        """Extract all migration-relevant patterns from a file."""
        lines = content.split("\n")

        for pattern_name, pattern in PATTERNS.items():
            for m in pattern.finditer(content):
                line_num = self._get_line_number(content, m.start())
                snippet = m.group(1).strip()
                # Truncate long snippets
                if len(snippet) > 200:
                    snippet = snippet[:200] + "..."

                detail = ""
                if len(m.groups()) > 1 and m.group(2):
                    detail = m.group(2)

                category = PATTERN_CATEGORIES.get(pattern_name, "Other")
                modern = MODERN_EQUIVALENTS.get(pattern_name, "Review manually")

                entry = {
                    "pattern_type": pattern_name,
                    "category": category,
                    "file": rel_path,
                    "line": line_num,
                    "code_snippet": snippet,
                    "detail": detail,
                    "modern_equivalent": modern
                }

                self.analysis["patterns"].append(entry)
                self.analysis["by_category"][category].append(entry)
                self.analysis["by_file"][rel_path].append(entry)

    def _generate_summary(self):
        category_counts = {}
        for cat, items in self.analysis["by_category"].items():
            category_counts[cat] = len(items)

        pattern_type_counts = defaultdict(int)
        for p in self.analysis["patterns"]:
            pattern_type_counts[p["pattern_type"]] += 1

        files_affected = len(self.analysis["by_file"])

        self.analysis["summary"] = {
            "total_patterns_found": len(self.analysis["patterns"]),
            "files_affected": files_affected,
            "by_category": category_counts,
            "by_pattern_type": dict(pattern_type_counts),
            "migration_effort_indicators": {
                "scope_bindings": category_counts.get("Scope Binding", 0),
                "watchers": category_counts.get("Watcher", 0),
                "event_system": category_counts.get("Event System", 0),
                "http_calls": category_counts.get("HTTP", 0),
                "promises": category_counts.get("Promise", 0),
                "timers": category_counts.get("Timer", 0),
                "dom_manipulation": category_counts.get("DOM Manipulation", 0),
                "rootscope_usage": category_counts.get("$rootScope", 0),
                "digest_cycle": category_counts.get("Digest Cycle", 0)
            }
        }


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="AngularJS Pattern Extractor - Extract migration-relevant patterns"
    )
    parser.add_argument(
        "source_dir",
        help="Directory containing AngularJS source code"
    )
    parser.add_argument(
        "-o", "--output",
        help="Output JSON file path",
        default="angularjs_patterns.json"
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

    extractor = AngularJSPatternExtractor(args.source_dir)
    analysis = extractor.scan()

    indent = 2 if args.pretty else None
    output_json = json.dumps(analysis, indent=indent, ensure_ascii=False)

    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(output_json)

    s = analysis["summary"]
    print(f"Analysis complete! Output: {args.output}")
    print(f"   Total patterns found: {s['total_patterns_found']}")
    print(f"   Files affected: {s['files_affected']}")
    indicators = s.get("migration_effort_indicators", {})
    print(f"   Scope bindings: {indicators.get('scope_bindings', 0)}")
    print(f"   Watchers: {indicators.get('watchers', 0)}")
    print(f"   Event system: {indicators.get('event_system', 0)}")
    print(f"   HTTP calls: {indicators.get('http_calls', 0)}")
    print(f"   Promises ($q): {indicators.get('promises', 0)}")
    print(f"   DOM manipulation: {indicators.get('dom_manipulation', 0)}")
    print(f"   $rootScope usage: {indicators.get('rootscope_usage', 0)}")

    return 0


if __name__ == "__main__":
    exit(main())
