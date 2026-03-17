#!/usr/bin/env python3
"""
AngularJS Metrics Analyzer
===========================
Code metrics analyzer for AngularJS codebases.
Computes per-file and aggregate metrics including LOC, controller/service counts,
$scope/$watch/$rootScope usage, jQuery usage, and cyclomatic complexity estimation.
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

CACHE_FILE = ".angularjs_metrics_cache.json"

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ============================================================================
# PARSING PATTERNS
# ============================================================================

PATTERNS = {
    # Artifact counts
    "controller": re.compile(r"\.\s*controller\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "service": re.compile(r"\.\s*service\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "factory": re.compile(r"\.\s*factory\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "directive": re.compile(r"\.\s*directive\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "component": re.compile(r"\.\s*component\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "filter": re.compile(r"\.\s*filter\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),

    # Usage counts
    "scope_usage": re.compile(r"\$scope\b", re.MULTILINE),
    "watch_usage": re.compile(r"\$scope\s*\.\s*\$watch\s*\(", re.MULTILINE),
    "rootscope_usage": re.compile(r"\$rootScope\b", re.MULTILINE),
    "jquery_usage": re.compile(r"(?:angular\s*\.\s*element|\$\s*\(|jQuery\s*\()", re.MULTILINE),
    "http_usage": re.compile(r"\$http\b", re.MULTILINE),

    # Cyclomatic complexity indicators
    "if_stmt": re.compile(r"\bif\s*\(", re.MULTILINE),
    "else_if_stmt": re.compile(r"\belse\s+if\s*\(", re.MULTILINE),
    "switch_stmt": re.compile(r"\bswitch\s*\(", re.MULTILINE),
    "case_stmt": re.compile(r"\bcase\s+", re.MULTILINE),
    "for_stmt": re.compile(r"\bfor\s*\(", re.MULTILINE),
    "while_stmt": re.compile(r"\bwhile\s*\(", re.MULTILINE),
    "ternary": re.compile(r"\?[^:]+:", re.MULTILINE),
    "logical_and": re.compile(r"&&", re.MULTILINE),
    "logical_or": re.compile(r"\|\|", re.MULTILINE),
    "catch_stmt": re.compile(r"\bcatch\s*\(", re.MULTILINE),

    # Comment patterns for stripping
    "single_comment": re.compile(r"//.*$", re.MULTILINE),
    "multi_comment": re.compile(r"/\*.*?\*/", re.DOTALL),
}

# ============================================================================
# METRICS ANALYZER CLASS
# ============================================================================

class AngularJSMetricsAnalyzer:
    def __init__(self, source_dir):
        self.source_dir = Path(source_dir)
        self.analysis = {
            "metadata": {
                "scan_date": datetime.now().isoformat(),
                "source_directory": str(self.source_dir),
                "scanner_version": "1.0.0",
                "scanner_type": "angularjs_metrics"
            },
            "summary": {},
            "per_file_metrics": [],
            "aggregate_metrics": {}
        }

    def scan(self):
        """Main entry point for analysis."""
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
            metrics = self._analyze_file(file_info, content)
            self.analysis["per_file_metrics"].append(metrics)

        self._compute_aggregates()

        self._save_to_cache(current_hash)
        return self.analysis

    def _calculate_source_hash(self):
        """Calculate a hash of all source files."""
        hasher = hashlib.md5()
        skip_dirs = {"node_modules", "bower_components", ".git", "dist", "build", "coverage", ".tmp"}
        files_for_hash = []
        for root, dirs, files in os.walk(self.source_dir):
            dirs[:] = [d for d in dirs if d not in skip_dirs]
            for fn in sorted(files):
                if fn.endswith(".js"):
                    fp = os.path.join(root, fn)
                    try:
                        st = os.stat(fp)
                        files_for_hash.append(f"{fn}{st.st_size}{st.st_mtime}")
                    except OSError:
                        pass
        for s in sorted(files_for_hash):
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

    def _discover_js_files(self):
        """Find all JavaScript files."""
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
        """Read file with proper encoding handling."""
        encodings = ['utf-8', 'latin1', 'cp1252', 'iso-8859-1']
        for enc in encodings:
            try:
                with open(filepath, 'r', encoding=enc) as f:
                    return f.read()
            except (UnicodeDecodeError, FileNotFoundError):
                continue
        return None

    def _strip_comments(self, content):
        """Remove comments from JS content for accurate metrics."""
        content = PATTERNS["multi_comment"].sub("", content)
        content = PATTERNS["single_comment"].sub("", content)
        return content

    def _analyze_file(self, file_info, content):
        """Compute metrics for a single file."""
        lines = content.split("\n")
        total_lines = len(lines)
        blank_lines = sum(1 for l in lines if l.strip() == "")
        comment_lines = sum(1 for l in lines if l.strip().startswith("//") or l.strip().startswith("/*") or l.strip().startswith("*"))
        code_lines = total_lines - blank_lines - comment_lines

        code_content = self._strip_comments(content)

        controllers = len(PATTERNS["controller"].findall(content))
        services = len(PATTERNS["service"].findall(content)) + len(PATTERNS["factory"].findall(content))
        directives = len(PATTERNS["directive"].findall(content))
        components = len(PATTERNS["component"].findall(content))
        filters = len(PATTERNS["filter"].findall(content))

        scope_count = len(PATTERNS["scope_usage"].findall(code_content))
        watch_count = len(PATTERNS["watch_usage"].findall(code_content))
        rootscope_count = len(PATTERNS["rootscope_usage"].findall(code_content))
        jquery_count = len(PATTERNS["jquery_usage"].findall(code_content))
        http_count = len(PATTERNS["http_usage"].findall(code_content))

        # Cyclomatic complexity estimation
        complexity = 1  # base complexity
        complexity += len(PATTERNS["if_stmt"].findall(code_content))
        complexity += len(PATTERNS["else_if_stmt"].findall(code_content))
        complexity += len(PATTERNS["case_stmt"].findall(code_content))
        complexity += len(PATTERNS["for_stmt"].findall(code_content))
        complexity += len(PATTERNS["while_stmt"].findall(code_content))
        complexity += len(PATTERNS["catch_stmt"].findall(code_content))
        complexity += len(PATTERNS["logical_and"].findall(code_content))
        complexity += len(PATTERNS["logical_or"].findall(code_content))

        return {
            "file": file_info["relative_path"],
            "size_bytes": file_info["size_bytes"],
            "loc": {
                "total": total_lines,
                "code": code_lines,
                "blank": blank_lines,
                "comment": comment_lines
            },
            "artifacts": {
                "controllers": controllers,
                "services": services,
                "directives": directives,
                "components": components,
                "filters": filters
            },
            "usage": {
                "scope_count": scope_count,
                "watch_count": watch_count,
                "rootscope_count": rootscope_count,
                "jquery_count": jquery_count,
                "http_count": http_count
            },
            "cyclomatic_complexity": complexity
        }

    def _compute_aggregates(self):
        """Compute aggregate metrics across all files."""
        metrics = self.analysis["per_file_metrics"]
        if not metrics:
            self.analysis["aggregate_metrics"] = {}
            self.analysis["summary"] = {"total_files": 0}
            return

        total_loc = sum(m["loc"]["total"] for m in metrics)
        total_code = sum(m["loc"]["code"] for m in metrics)
        total_blank = sum(m["loc"]["blank"] for m in metrics)
        total_comment = sum(m["loc"]["comment"] for m in metrics)
        total_controllers = sum(m["artifacts"]["controllers"] for m in metrics)
        total_services = sum(m["artifacts"]["services"] for m in metrics)
        total_directives = sum(m["artifacts"]["directives"] for m in metrics)
        total_components = sum(m["artifacts"]["components"] for m in metrics)
        total_filters = sum(m["artifacts"]["filters"] for m in metrics)
        total_scope = sum(m["usage"]["scope_count"] for m in metrics)
        total_watch = sum(m["usage"]["watch_count"] for m in metrics)
        total_rootscope = sum(m["usage"]["rootscope_count"] for m in metrics)
        total_jquery = sum(m["usage"]["jquery_count"] for m in metrics)
        total_http = sum(m["usage"]["http_count"] for m in metrics)
        complexities = [m["cyclomatic_complexity"] for m in metrics]
        avg_complexity = sum(complexities) / len(complexities) if complexities else 0
        max_complexity = max(complexities) if complexities else 0
        max_complexity_file = ""
        for m in metrics:
            if m["cyclomatic_complexity"] == max_complexity:
                max_complexity_file = m["file"]
                break

        # Top 10 most complex files
        sorted_by_complexity = sorted(metrics, key=lambda x: x["cyclomatic_complexity"], reverse=True)
        top_complex = [
            {"file": m["file"], "complexity": m["cyclomatic_complexity"]}
            for m in sorted_by_complexity[:10]
        ]

        # Top 10 largest files
        sorted_by_loc = sorted(metrics, key=lambda x: x["loc"]["code"], reverse=True)
        top_largest = [
            {"file": m["file"], "code_lines": m["loc"]["code"]}
            for m in sorted_by_loc[:10]
        ]

        self.analysis["aggregate_metrics"] = {
            "loc": {
                "total": total_loc,
                "code": total_code,
                "blank": total_blank,
                "comment": total_comment,
                "comment_ratio": round(total_comment / total_code, 3) if total_code else 0
            },
            "artifacts": {
                "controllers": total_controllers,
                "services": total_services,
                "directives": total_directives,
                "components": total_components,
                "filters": total_filters,
                "total": total_controllers + total_services + total_directives + total_components + total_filters
            },
            "usage": {
                "scope_count": total_scope,
                "watch_count": total_watch,
                "rootscope_count": total_rootscope,
                "jquery_count": total_jquery,
                "http_count": total_http
            },
            "complexity": {
                "average": round(avg_complexity, 2),
                "max": max_complexity,
                "max_file": max_complexity_file,
                "top_10_complex_files": top_complex
            },
            "top_10_largest_files": top_largest
        }

        self.analysis["summary"] = {
            "total_files": len(metrics),
            "total_code_lines": total_code,
            "total_artifacts": total_controllers + total_services + total_directives + total_components + total_filters,
            "total_scope_usage": total_scope,
            "total_watch_count": total_watch,
            "total_rootscope_usage": total_rootscope,
            "total_jquery_usage": total_jquery,
            "avg_complexity": round(avg_complexity, 2),
            "max_complexity": max_complexity,
            "max_complexity_file": max_complexity_file
        }


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="AngularJS Metrics Analyzer - Code metrics for AngularJS codebases"
    )
    parser.add_argument(
        "source_dir",
        help="Directory containing AngularJS source code"
    )
    parser.add_argument(
        "-o", "--output",
        help="Output JSON file path",
        default="angularjs_metrics.json"
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

    analyzer = AngularJSMetricsAnalyzer(args.source_dir)
    analysis = analyzer.scan()

    indent = 2 if args.pretty else None
    output_json = json.dumps(analysis, indent=indent, ensure_ascii=False)

    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(output_json)

    s = analysis["summary"]
    print(f"Analysis complete! Output: {args.output}")
    print(f"   Files analyzed: {s.get('total_files', 0)}")
    print(f"   Code lines: {s.get('total_code_lines', 0)}")
    print(f"   Total artifacts: {s.get('total_artifacts', 0)}")
    print(f"   $scope usage: {s.get('total_scope_usage', 0)}")
    print(f"   $watch count: {s.get('total_watch_count', 0)}")
    print(f"   $rootScope usage: {s.get('total_rootscope_usage', 0)}")
    print(f"   Avg complexity: {s.get('avg_complexity', 0)}")
    print(f"   Max complexity: {s.get('max_complexity', 0)} ({s.get('max_complexity_file', 'N/A')})")

    return 0


if __name__ == "__main__":
    exit(main())
