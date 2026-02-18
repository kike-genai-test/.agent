#!/usr/bin/env python3
"""
VB6 Logic Extractor
==================
Reads the comprehensive analysis JSON and generates a Markdown report
containing the logic (code) of forms, modules, and classes.
Target: VB6_LOGIC_ANALYSIS.md
"""

import os
import json
import argparse
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description="Extract VB6 Logic to Markdown")
    parser.add_argument("input_json", help="Path to comprehensive.json")
    parser.add_argument("-o", "--output", help="Output Markdown file", default="VB6_LOGIC_ANALYSIS.md")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input_json):
        print(f"❌ Input file not found: {args.input_json}")
        return 1
        
    try:
        with open(args.input_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Error reading JSON: {e}")
        return 1
        
    output_lines = []
    output_lines.append("# VB6 Logic Analysis")
    output_lines.append(f"\nGenerated from: `{args.input_json}`")
    output_lines.append("\n> [!NOTE]")
    output_lines.append("> This document contains the extracted logic (code) from forms, modules, and classes.")
    output_lines.append("> Use this to implement business rules, validations, and workflows in the new system.")
    
    # Process Forms
    if "forms" in data:
        output_lines.append("\n## Forms Logic")
        for form in data["forms"]:
            name = form.get("name", "Unknown")
            output_lines.append(f"\n### Form: {name}")
            
            # Properties
            props = form.get("properties", [])
            if props:
                output_lines.append("\n**Key Properties:**")
                output_lines.append("| Property | Value |")
                output_lines.append("|----------|-------|")
                for p in props:
                    output_lines.append(f"| {p.get('name')} | {p.get('value')} |")
            
            # Events
            events = form.get("events", [])
            if events:
                output_lines.append("\n#### Events")
                for evt in events:
                    control = evt.get("control", "Form")
                    event_name = evt.get("event", "Load")
                    logic = evt.get("logic", "").strip()
                    
                    if logic:
                        output_lines.append(f"\n**{control}_{event_name}**")
                        output_lines.append("```vb")
                        output_lines.append(logic)
                        output_lines.append("```")
            
            # Functions
            funcs = form.get("functions", [])
            if funcs:
                output_lines.append("\n#### Functions")
                for func in funcs:
                    fname = func.get("name", "Unknown")
                    logic = func.get("logic", "").strip()
                    
                    if logic:
                        output_lines.append(f"\n**Function: {fname}**")
                        output_lines.append("```vb")
                        output_lines.append(logic)
                        output_lines.append("```")
                        
    # Process Modules
    if "modules" in data:
        output_lines.append("\n## Modules Logic")
        for module in data["modules"]:
            name = module.get("name", "Unknown")
            output_lines.append(f"\n### Module: {name}")
            
            funcs = module.get("functions", [])
            for func in funcs:
                fname = func.get("name", "Unknown")
                logic = func.get("logic", "").strip()
                
                if logic:
                    output_lines.append(f"\n**Function: {fname}**")
                    output_lines.append("```vb")
                    output_lines.append(logic)
                    output_lines.append("```")

    # Process Classes
    if "classes" in data:
        output_lines.append("\n## Classes Logic")
        for cls in data["classes"]:
            name = cls.get("name", "Unknown")
            output_lines.append(f"\n### Class: {name}")
            
            methods = cls.get("methods", [])
            for method in methods:
                mname = method.get("name", "Unknown")
                logic = method.get("logic", "").strip()
                
                if logic:
                    output_lines.append(f"\n**Method: {mname}**")
                    output_lines.append("```vb")
                    output_lines.append(logic)
                    output_lines.append("```")

    # Write output
    with open(args.output, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output_lines))
        
    print(f"✅ Generated {args.output}")
    return 0

if __name__ == "__main__":
    exit(main())
