const fs = require("fs-extra");
const path = require("path");

const IGNORED_DIRS = [".git", "node_modules", "dist", "build", ".github", ".vscode", "coverage", "thirdparty", "vendor", "external"];
const IGNORED_EXTENSIONS = [
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
    ".pdf", ".zip", ".gz", ".tar", ".mp4", ".mov",
    ".avi", ".ttf", ".woff", ".woff2", ".eot"
];
const IGNORED_FILES = [
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "composer.lock",
    ".DS_Store", "DS_Store"
];

const EXT_LANG = {
    ".js": "JavaScript",
    ".jsx": "React JSX",
    ".ts": "TypeScript",
    ".tsx": "React TSX",
    ".py": "Python",
    ".java": "Java",
    ".c": "C",
    ".cpp": "C++",
    ".rs": "Rust",
    ".go": "Go",
    ".html": "HTML",
    ".css": "CSS",
    ".json": "JSON",
    ".md": "Markdown",
    ".sh": "Shell",
    ".yml": "YAML",
    ".yaml": "YAML",
};

async function scanFiles(currentDir, rootDir = currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    let files = [];

    for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
            if (IGNORED_DIRS.includes(entry.name)) {
                continue;
            }
            const nestedFiles = await scanFiles(fullPath, rootDir);
            files.push(...nestedFiles);
        } else {
            const ext = path.extname(entry.name).toLowerCase();

            // Phase 2: Filtering
            if (IGNORED_EXTENSIONS.includes(ext) || IGNORED_FILES.includes(entry.name)) {
                continue;
            }

            try {
                const stats = await fs.stat(fullPath);
                const type = entry.name === "Dockerfile" ? "Docker" : EXT_LANG[ext] || "Unknown";

                files.push({
                    path: path.relative(rootDir, fullPath),
                    name: entry.name,
                    type,
                    size: stats.size, // in bytes
                    extension: ext
                });
            } catch (err) {
                console.error(`Error reading stats for ${fullPath}:`, err);
            }
        }
    }
    return files;
}

module.exports = scanFiles;