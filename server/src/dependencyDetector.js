const fs = require("fs-extra");
const path = require("path");

async function detectDependencies(files, baseDirPath) {
    const dependencies = [];
    const fileMap = new Map();

    // Create a map for quick lookup
    files.forEach(f => fileMap.set(f.path, f));

    const sourceExtensions = [".js", ".jsx", ".ts", ".tsx"];
    const candidateFiles = files.filter(f => sourceExtensions.includes(f.extension));

    for (const file of candidateFiles) {
        try {
            const fullPath = path.join(baseDirPath, file.path);
            const content = await fs.readFile(fullPath, "utf-8");

            // Look for imports (static and dynamic)
            // import { x } from './y'
            // require('./y')
            const importRegex = /(?:import|from|require)\s*\(?\s*['"]([^'"]+)['"]/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                const targetPath = match[1];
                if (!targetPath.startsWith('.')) continue; // Skip node_modules

                // Resolve path roughly
                const dir = path.dirname(file.path);
                let resolvedPath = path.normpath(path.join(dir, targetPath));

                // Try extensions if missing
                let foundMatch = null;
                const extensionsToTry = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];

                for (const ext of extensionsToTry) {
                    const p = resolvedPath + ext;
                    if (fileMap.has(p)) {
                        foundMatch = p;
                        break;
                    }
                }

                if (foundMatch) {
                    dependencies.push({
                        source: file.path,
                        target: foundMatch
                    });
                }
            }
        } catch (err) {
            // Silently skip read errors
        }
    }

    // Deduplicate
    return dependencies.filter((dep, index, self) =>
        index === self.findIndex((d) => d.source === dep.source && d.target === dep.target)
    );
}

// Minimal path.normalize implementation since we might be on a diff OS or just to be safe
path.normpath = function (p) {
    return p.split('/').reduce((acc, part) => {
        if (part === '..') acc.pop();
        else if (part !== '.' && part !== '') acc.push(part);
        return acc;
    }, []).join('/');
};

module.exports = detectDependencies;
