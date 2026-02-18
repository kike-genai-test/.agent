const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Determine paths
const AGENT_DIR = path.resolve(__dirname, '..'); // .agent folder
const WORKSPACE_DIR = path.resolve(AGENT_DIR, '..'); // Parent folder (Desktop/GenAI)
const PROCESSED_DB_FILE = path.join(AGENT_DIR, 'processed_projects.json');
const MIGRATION_SCRIPT = path.join(__dirname, 'analyze_and_migrate.sh');

console.log(`Looking for projects in: ${WORKSPACE_DIR}`);

// Load processed projects state
let processedProjects = [];
if (fs.existsSync(PROCESSED_DB_FILE)) {
    try {
        processedProjects = JSON.parse(fs.readFileSync(PROCESSED_DB_FILE));
    } catch (e) {
        console.error("Error reading processed DB:", e);
    }
}

function saveProcessedProjects() {
    fs.writeFileSync(PROCESSED_DB_FILE, JSON.stringify(processedProjects, null, 2));
}

function isIgnored(dirName) {
    const lowerName = dirName.toLowerCase();
    if (lowerName.startsWith('.')) return true; // .agent, .git, .vscode
    if (lowerName.startsWith('biblioteca-v')) return true; // Output folders
    if (lowerName.includes('-v')) {
        // Generic check for versioned output folders (e.g. legacyapp_vb6-v1)
        // Heuristic: ends with -v\d+
        if (/.*-v\d+$/.test(lowerName)) return true;
    }
    if (lowerName === 'node_modules') return true;
    return false;
}

function processDirectory(dirName) {
    const fullPath = path.join(WORKSPACE_DIR, dirName);

    // Check if it's a directory
    try {
        if (!fs.statSync(fullPath).isDirectory()) return;
    } catch (e) {
        return;
    }

    if (isIgnored(dirName)) {
        return;
    }

    if (processedProjects.includes(fullPath)) {
        return;
    }

    console.log(`\n🚀 Detected new project candidate: ${dirName}`);
    console.log(`   Path: ${fullPath}`);

    // Mark as processed immediately to prevent loops (can be removed if we want to allow re-runs on restart)
    // For now, we only run once per discovery
    processedProjects.push(fullPath);
    saveProcessedProjects();

    const child = spawn('bash', [MIGRATION_SCRIPT, fullPath], {
        stdio: 'inherit',
        cwd: WORKSPACE_DIR
    });

    child.on('close', (code) => {
        console.log(`\n✅ Migration process for ${dirName} finished with code ${code}`);
    });
}

// Initial Scan
console.log("Starting initial scan...");
const files = fs.readdirSync(WORKSPACE_DIR);
files.forEach(processDirectory);

// Watch for changes (polling for stability on different OS)
console.log("\n👀 Watching for new folders...");
let scanTimeout = null;

fs.watch(WORKSPACE_DIR, (eventType, filename) => {
    if (filename) {
        // Debounce slightly
        if (scanTimeout) clearTimeout(scanTimeout);
        scanTimeout = setTimeout(() => {
            if (fs.existsSync(path.join(WORKSPACE_DIR, filename))) {
                processDirectory(filename);
            }
        }, 1000);
    }
});
