import os
import sys
import argparse

def detect_stack(project_path):
    if not os.path.exists(project_path):
        print("Error: Path does not exist")
        sys.exit(1)

    # Counters for file extensions
    ext_counts = {}
    
    for root, dirs, files in os.walk(project_path):
        # Ignore common non-source directories
        if 'node_modules' in dirs: dirs.remove('node_modules')
        if '.git' in dirs: dirs.remove('.git')
        if 'bin' in dirs: dirs.remove('bin')
        if 'obj' in dirs: dirs.remove('obj')

        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext:
                ext_counts[ext] = ext_counts.get(ext, 0) + 1

    # Heuristics
    if ext_counts.get('.vbp', 0) > 0 or ext_counts.get('.frm', 0) > 0:
        return "vb6"
    elif ext_counts.get('.cs', 0) > 0 and ext_counts.get('.csproj', 0) > 0:
        return "csharp"
    elif ext_counts.get('.java', 0) > 0:
        return "java"
    elif ext_counts.get('.py', 0) > 0:
        return "python"
    elif ext_counts.get('.ts', 0) > 0 or ext_counts.get('.js', 0) > 0:
        return "javascript" # or typescript, but generally web/node
    else:
        return "unknown"

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Detect technology stack of a project')
    parser.add_argument('path', help='Path to the project directory')
    args = parser.parse_args()

    stack = detect_stack(args.path)
    print(stack)
