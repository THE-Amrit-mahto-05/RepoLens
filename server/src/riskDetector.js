const fs = require("fs-extra");
const path = require("path");

async function detectRisks(files, baseDirPath) {
    const risks = [];

    const hasTests = files.some(f =>
        f.path.toLowerCase().includes("test") ||
        f.path.toLowerCase().includes("spec") ||
        f.path.toLowerCase().includes("__tests__")
    );

    if (!hasTests) {
        risks.push({
            file: "Project Root",
            reason: "No test suite detected (Missing tests)",
            severity: "high"
        });
    }

    for (const file of files) {
        const sourceExtensions = [".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".go"];
        if (!sourceExtensions.includes(file.extension)) continue;

        try {
            const fullPath = path.join(baseDirPath, file.path);
            const content = await fs.readFile(fullPath, "utf-8");
            const lines = content.split("\n");

            if (lines.length > 500) {
                risks.push({
                    file: file.path,
                    reason: `High complexity: ${lines.length} lines of code`,
                    severity: "medium"
                });
            }

            const importMatches = content.match(/import\s+|require\s*\(/g) || [];
            if (importMatches.length > 15) {
                risks.push({
                    file: file.path,
                    reason: `Fragile: Too many dependencies (${importMatches.length} imports)`,
                    severity: "medium"
                });
            }

            const depth = file.path.split("/").length;
            if (depth > 6) {
                risks.push({
                    file: file.path,
                    reason: "Deeply nested file path (Hard to maintain)",
                    severity: "low"
                });
            }

        } catch (err) {
        }
    }

    return risks.sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.severity] - order[b.severity];
    }).slice(0, 8); // Top 8 risks
}

module.exports = detectRisks;
