#!/usr/bin/env python3
"""
Prisma SQLite Schema Validator
Validates Prisma schemas specifically for the database-stack rules.

Usage:
    python schema_validator.py <project_path>

Checks:
    - Prisma schema syntax
    - Missing relations and indexes
    - Naming conventions
    - SQLite compatibility (no unsupported types)
    - Soft-delete compliance (deletedAt)
    - Timestamp compliance (createdAt, updatedAt)
"""

import sys
import json
import re
from pathlib import Path
from datetime import datetime

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except:
    pass


def find_schema_files(project_path: Path) -> list:
    """Find Prisma schema files."""
    prisma_files = list(project_path.glob('**/prisma/schema.prisma'))
    return [('prisma', f) for f in prisma_files][:10]


def validate_prisma_schema(file_path: Path) -> list:
    """Validate Prisma schema file against SQLite/Stack rules."""
    issues = []
    
    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        
        # Check SQLite Database provider
        if 'provider = "sqlite"' not in content:
            issues.append("CRITICAL: Schema must use SQLite provider (provider = \"sqlite\")")

        # Find all models
        models = re.findall(r'model\s+(\w+)\s*{([^}]+)}', content, re.DOTALL)
        
        for model_name, model_body in models:
            # Check naming convention (PascalCase)
            if not model_name[0].isupper():
                issues.append(f"Model '{model_name}': Should be PascalCase")
            
            # Check for id field
            if '@id' not in model_body and 'id' not in model_body.lower():
                issues.append(f"Model '{model_name}': Missing @id field")
            
            # Check for createdAt/updatedAt
            if 'createdAt' not in model_body:
                issues.append(f"Model '{model_name}': Missing 'createdAt DateTime @default(now())'")
            if 'updatedAt' not in model_body:
                 issues.append(f"Model '{model_name}': Missing 'updatedAt DateTime @updatedAt'")

            # Check for Soft Deletes
            if 'deletedAt DateTime?' not in model_body:
                issues.append(f"Model '{model_name}': Missing 'deletedAt DateTime?' for soft deletes")

            # Check for SQLite unsupported types (Arrays and Json)
            if re.search(r'\w+\[\]\s', model_body):
                issues.append(f"Model '{model_name}': Scalar arrays (like String[]) are NOT supported by SQLite")
            if 'Json' in model_body:
                issues.append(f"Model '{model_name}': JSON types are NOT natively supported by SQLite Prisma provider")

            # Strict Index Checking (N+1 Prevention)
            # Find all foreign key fields by looking for @relation
            relations = re.findall(r'@relation\([\s\S]*?fields:\s*\[([\w\s,]+)\].*?\)', model_body)
            for relation_fields in relations:
                fields = [f.strip() for f in relation_fields.split(',')]
                for field in fields:
                    # Check if an index exists for this specific foreign key field
                    if f'@@index([{field}])' not in model_body and f'@@index(["{field}"])' not in model_body:
                         issues.append(f"Model '{model_name}': Missing @@index([{field}]) for relationship field to prevent slow queries")

        # Check for enum definitions (Not supported in SQLite Prisma)
        enums = re.findall(r'enum\s+(\w+)\s*{', content)
        if enums:
            for enum_name in enums:
                issues.append(f"CRITICAL: Enums ('{enum_name}') are NOT supported in SQLite. Use plain Strings instead.")
        
    except Exception as e:
        issues.append(f"Error reading schema: {str(e)[:50]}")
    
    return issues


def main():
    project_path = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    
    print(f"\n{'='*60}")
    print(f"[SQLITE STACK VALIDATOR] Database Schema Validation")
    print(f"{'='*60}")
    print(f"Project: {project_path}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-"*60)
    
    schemas = find_schema_files(project_path)
    
    if not schemas:
        output = {
            "script": "schema_validator",
            "project": str(project_path),
            "schemas_checked": 0,
            "issues_found": 0,
            "passed": True,
            "message": "No Prisma schema files found in the project"
        }
        print(f"Found 0 schema files")
        print(json.dumps(output, indent=2))
        sys.exit(0)
        
    print(f"Found {len(schemas)} schema file(s)")
    
    all_issues = []
    
    for schema_type, file_path in schemas:
        print(f"\nValidating: {file_path.name}")
        issues = validate_prisma_schema(file_path)
        
        if issues:
            all_issues.append({
                "file": str(file_path.name),
                "type": schema_type,
                "issues": issues
            })
    
    print("\n" + "="*60)
    print("SCHEMA ISSUES")
    print("="*60)
    
    if all_issues:
        for item in all_issues:
            print(f"\n{item['file']}:")
            for issue in item["issues"]:
                print(f"  ❌ {issue}")
    else:
        print("✅ No schema issues found! Schema complies with database-stack.")
    
    total_issues = sum(len(item["issues"]) for item in all_issues)
    passed = total_issues == 0
    
    output = {
        "script": "schema_validator",
        "project": str(project_path),
        "schemas_checked": len(schemas),
        "issues_found": total_issues,
        "passed": passed,
        "issues": all_issues
    }
    
    print("\n" + json.dumps(output, indent=2))
    
    # Exit with code 1 if there are issues to fail CI/CD pipelines
    sys.exit(1 if not passed else 0)


if __name__ == "__main__":
    main()
