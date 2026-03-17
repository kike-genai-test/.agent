#!/usr/bin/env python3
"""
AngularJS Dependency Graph
============================
Builds a module dependency graph for AngularJS codebases.
Parses angular.module() declarations, maps module-to-module dependencies,
controller/service-to-module membership, and injection dependencies between
services. Outputs JSON dependency data and optionally generates an HTML
visualization with D3.js.
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

CACHE_FILE = ".angularjs_depgraph_cache.json"

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ============================================================================
# PARSING PATTERNS
# ============================================================================

PATTERNS = {
    # Module declaration with dependencies: angular.module('name', ['dep1', 'dep2'])
    "module_decl": re.compile(
        r"angular\s*\.\s*module\s*\(\s*['\"]([^'\"]+)['\"]\s*,\s*\[([^\]]*)\]",
        re.MULTILINE
    ),
    # Module reference (getter): angular.module('name')
    "module_ref": re.compile(
        r"angular\s*\.\s*module\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",
        re.MULTILINE
    ),

    # Artifact registrations chained on module
    "controller": re.compile(r"\.\s*controller\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "service": re.compile(r"\.\s*service\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "factory": re.compile(r"\.\s*factory\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "directive": re.compile(r"\.\s*directive\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "component": re.compile(r"\.\s*component\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "filter": re.compile(r"\.\s*filter\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "provider": re.compile(r"\.\s*provider\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "constant": re.compile(r"\.\s*constant\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),
    "value": re.compile(r"\.\s*value\s*\(\s*['\"]([^'\"]+)['\"]", re.MULTILINE),

    # $inject annotation
    "inject_annotation": re.compile(
        r"(\w+)\s*\.\s*\$inject\s*=\s*\[([^\]]*)\]",
        re.MULTILINE
    ),
    # Inline injection array
    "inline_injection": re.compile(
        r"\[\s*((?:['\"][^'\"]+['\"],?\s*)+)function\s*\(",
        re.MULTILINE
    ),
    # Function parameters (for implicit injection detection)
    "function_params": re.compile(
        r"function\s*\(([^)]*)\)",
        re.MULTILINE
    ),
}


# ============================================================================
# DEPENDENCY GRAPH CLASS
# ============================================================================

class AngularJSDependencyGraph:
    def __init__(self, source_dir):
        self.source_dir = Path(source_dir)
        self.analysis = {
            "metadata": {
                "scan_date": datetime.now().isoformat(),
                "source_directory": str(self.source_dir),
                "scanner_version": "1.0.0",
                "scanner_type": "angularjs_dependency_graph"
            },
            "summary": {},
            "modules": {},
            "module_dependencies": [],
            "artifact_to_module": [],
            "injection_dependencies": [],
            "graph": {
                "nodes": [],
                "edges": []
            }
        }

    def scan(self):
        """Main entry point."""
        print(f"Scanning: {self.source_dir}")

        current_hash = self._calculate_source_hash()
        if self._load_from_cache(current_hash):
            return self.analysis

        js_files = self._discover_js_files()
        print(f"Found {len(js_files)} JavaScript files")

        # First pass: collect module declarations
        file_contents = {}
        for fi in js_files:
            content = self._read_file(fi["path"])
            if content:
                file_contents[fi["relative_path"]] = content

        self._parse_modules(file_contents)
        self._parse_artifacts(file_contents)
        self._parse_injections(file_contents)
        self._build_graph()
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

    def _parse_modules(self, file_contents):
        """Parse angular.module() declarations and build module map."""
        for rel, content in file_contents.items():
            for m in PATTERNS["module_decl"].finditer(content):
                mod_name = m.group(1)
                dep_str = m.group(2)
                deps = [d.strip().strip("'\"") for d in dep_str.split(",") if d.strip().strip("'\"")]

                if mod_name not in self.analysis["modules"]:
                    self.analysis["modules"][mod_name] = {
                        "name": mod_name,
                        "declared_in": rel,
                        "dependencies": deps,
                        "controllers": [],
                        "services": [],
                        "factories": [],
                        "directives": [],
                        "components": [],
                        "filters": [],
                        "providers": [],
                        "constants": [],
                        "values": []
                    }

                for dep in deps:
                    self.analysis["module_dependencies"].append({
                        "from": mod_name,
                        "to": dep,
                        "file": rel
                    })

    def _find_module_for_file(self, rel_path, content):
        """Determine which module a file's artifacts belong to."""
        # Look for module declaration in this file
        decl_match = PATTERNS["module_decl"].search(content)
        if decl_match:
            return decl_match.group(1)
        # Look for module getter reference
        ref_match = PATTERNS["module_ref"].search(content)
        if ref_match:
            return ref_match.group(1)
        return None

    def _parse_artifacts(self, file_contents):
        """Map controllers, services, etc. to their modules."""
        artifact_types = [
            ("controller", "controllers"),
            ("service", "services"),
            ("factory", "factories"),
            ("directive", "directives"),
            ("component", "components"),
            ("filter", "filters"),
            ("provider", "providers"),
            ("constant", "constants"),
            ("value", "values"),
        ]

        for rel, content in file_contents.items():
            module_name = self._find_module_for_file(rel, content)

            for pattern_key, collection_key in artifact_types:
                for m in PATTERNS[pattern_key].finditer(content):
                    artifact_name = m.group(1)
                    entry = {
                        "name": artifact_name,
                        "type": pattern_key,
                        "module": module_name,
                        "file": rel
                    }
                    self.analysis["artifact_to_module"].append(entry)

                    # Add to module's collection if module exists
                    if module_name and module_name in self.analysis["modules"]:
                        self.analysis["modules"][module_name][collection_key].append(artifact_name)

    def _parse_injections(self, file_contents):
        """Parse injection dependencies between artifacts."""
        # Collect all known artifact names
        known_artifacts = set()
        for entry in self.analysis["artifact_to_module"]:
            known_artifacts.add(entry["name"])

        for rel, content in file_contents.items():
            # $inject annotations
            for m in PATTERNS["inject_annotation"].finditer(content):
                artifact = m.group(1)
                deps = [d.strip().strip("'\"") for d in m.group(2).split(",") if d.strip().strip("'\"")]
                for dep in deps:
                    if dep in known_artifacts:
                        self.analysis["injection_dependencies"].append({
                            "from": artifact,
                            "to": dep,
                            "file": rel,
                            "type": "explicit_inject"
                        })

            # Inline injection arrays
            for m in PATTERNS["inline_injection"].finditer(content):
                deps = [d.strip().strip("'\"") for d in m.group(1).split(",") if d.strip().strip("'\"")]
                for dep in deps:
                    if dep in known_artifacts:
                        self.analysis["injection_dependencies"].append({
                            "from": "(inline)",
                            "to": dep,
                            "file": rel,
                            "type": "inline_inject"
                        })

    def _build_graph(self):
        """Build a unified graph structure for visualization."""
        nodes = set()
        edges = []

        # Module nodes
        for mod_name in self.analysis["modules"]:
            nodes.add(mod_name)

        # Module-to-module edges
        for dep in self.analysis["module_dependencies"]:
            nodes.add(dep["from"])
            nodes.add(dep["to"])
            edges.append({
                "source": dep["from"],
                "target": dep["to"],
                "type": "module_dependency"
            })

        # Artifact-to-module edges
        for entry in self.analysis["artifact_to_module"]:
            if entry["module"]:
                nodes.add(entry["name"])
                edges.append({
                    "source": entry["name"],
                    "target": entry["module"],
                    "type": "belongs_to"
                })

        # Injection edges
        for inj in self.analysis["injection_dependencies"]:
            if inj["from"] != "(inline)":
                nodes.add(inj["from"])
            nodes.add(inj["to"])
            if inj["from"] != "(inline)":
                edges.append({
                    "source": inj["from"],
                    "target": inj["to"],
                    "type": "injects"
                })

        # Build node list with types
        node_types = {}
        for mod_name in self.analysis["modules"]:
            node_types[mod_name] = "module"
        for entry in self.analysis["artifact_to_module"]:
            node_types[entry["name"]] = entry["type"]

        self.analysis["graph"]["nodes"] = [
            {"id": n, "type": node_types.get(n, "unknown")}
            for n in sorted(nodes)
        ]
        self.analysis["graph"]["edges"] = edges

    def _generate_summary(self):
        self.analysis["summary"] = {
            "total_modules": len(self.analysis["modules"]),
            "total_artifacts": len(self.analysis["artifact_to_module"]),
            "total_module_dependencies": len(self.analysis["module_dependencies"]),
            "total_injection_dependencies": len(self.analysis["injection_dependencies"]),
            "graph_nodes": len(self.analysis["graph"]["nodes"]),
            "graph_edges": len(self.analysis["graph"]["edges"]),
            "modules": list(self.analysis["modules"].keys())
        }

    def generate_html(self, output_path):
        """Generate an HTML visualization using D3.js force-directed graph."""
        nodes_json = json.dumps(self.analysis["graph"]["nodes"])
        edges_json = json.dumps(self.analysis["graph"]["edges"])

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AngularJS Dependency Graph</title>
<style>
  body {{ margin: 0; font-family: Arial, sans-serif; background: #1a1a2e; color: #eee; }}
  svg {{ width: 100vw; height: 100vh; }}
  .node circle {{ stroke: #fff; stroke-width: 1.5px; }}
  .node text {{ font-size: 10px; fill: #ccc; pointer-events: none; }}
  .link {{ stroke-opacity: 0.6; fill: none; }}
  .link.module_dependency {{ stroke: #e94560; stroke-width: 2px; }}
  .link.belongs_to {{ stroke: #0f3460; stroke-width: 1px; stroke-dasharray: 4,2; }}
  .link.injects {{ stroke: #16c79a; stroke-width: 1.5px; }}
  .legend {{ position: fixed; top: 10px; left: 10px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; }}
  .legend div {{ margin: 4px 0; }}
  .legend span {{ display: inline-block; width: 20px; height: 3px; margin-right: 8px; vertical-align: middle; }}
</style>
</head>
<body>
<div class="legend">
  <strong>AngularJS Dependency Graph</strong>
  <div><span style="background:#e94560;height:3px;"></span>Module dependency</div>
  <div><span style="background:#0f3460;height:2px;border-top:2px dashed #0f3460;"></span>Belongs to</div>
  <div><span style="background:#16c79a;height:3px;"></span>Injects</div>
</div>
<svg></svg>
<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
const nodes = {nodes_json};
const links = {edges_json};

const colorMap = {{
  module: "#e94560",
  controller: "#533483",
  service: "#0f3460",
  factory: "#16c79a",
  directive: "#e9b872",
  component: "#48c9b0",
  filter: "#af7ac5",
  provider: "#f39c12",
  constant: "#95a5a6",
  value: "#bdc3c7",
  unknown: "#7f8c8d"
}};

const sizeMap = {{
  module: 12,
  controller: 8,
  service: 8,
  factory: 8,
  directive: 7,
  component: 7,
  filter: 6,
  provider: 6,
  constant: 5,
  value: 5,
  unknown: 5
}};

const width = window.innerWidth;
const height = window.innerHeight;

const svg = d3.select("svg").attr("width", width).attr("height", height);
const g = svg.append("g");

svg.call(d3.zoom().on("zoom", (event) => g.attr("transform", event.transform)));

const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id(d => d.id).distance(80))
  .force("charge", d3.forceManyBody().strength(-200))
  .force("center", d3.forceCenter(width / 2, height / 2));

const link = g.append("g").selectAll("line")
  .data(links).enter().append("line")
  .attr("class", d => "link " + d.type)
  .attr("marker-end", "url(#arrow)");

const node = g.append("g").selectAll("g")
  .data(nodes).enter().append("g")
  .attr("class", "node")
  .call(d3.drag()
    .on("start", (event, d) => {{ if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }})
    .on("drag", (event, d) => {{ d.fx = event.x; d.fy = event.y; }})
    .on("end", (event, d) => {{ if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }})
  );

node.append("circle")
  .attr("r", d => sizeMap[d.type] || 5)
  .attr("fill", d => colorMap[d.type] || "#7f8c8d");

node.append("text")
  .attr("dx", 12).attr("dy", 4)
  .text(d => d.id);

node.append("title").text(d => d.id + " (" + d.type + ")");

simulation.on("tick", () => {{
  link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
  node.attr("transform", d => "translate(" + d.x + "," + d.y + ")");
}});
</script>
</body>
</html>"""
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"HTML visualization written to: {output_path}")


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="AngularJS Dependency Graph - Module and injection dependency mapper"
    )
    parser.add_argument(
        "source_dir",
        help="Directory containing AngularJS source code"
    )
    parser.add_argument(
        "-o", "--output",
        help="Output JSON file path",
        default="angularjs_dependencies.json"
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty print JSON output"
    )
    parser.add_argument(
        "--html",
        help="Generate HTML visualization at the given path",
        default=None
    )

    args = parser.parse_args()

    if not os.path.isdir(args.source_dir):
        print(f"Error: Directory not found: {args.source_dir}")
        return 1

    grapher = AngularJSDependencyGraph(args.source_dir)
    analysis = grapher.scan()

    indent = 2 if args.pretty else None
    output_json = json.dumps(analysis, indent=indent, ensure_ascii=False)

    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(output_json)

    if args.html:
        grapher.generate_html(args.html)

    s = analysis["summary"]
    print(f"Analysis complete! Output: {args.output}")
    print(f"   Modules: {s['total_modules']}")
    print(f"   Artifacts: {s['total_artifacts']}")
    print(f"   Module dependencies: {s['total_module_dependencies']}")
    print(f"   Injection dependencies: {s['total_injection_dependencies']}")
    print(f"   Graph nodes: {s['graph_nodes']}")
    print(f"   Graph edges: {s['graph_edges']}")

    return 0


if __name__ == "__main__":
    exit(main())
