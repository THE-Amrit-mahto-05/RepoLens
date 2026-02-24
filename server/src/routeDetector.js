const fs = require("fs-extra");

async function detectRoutes(files, baseDirPath) {
    const routes = [];

    const candidateFiles = files.filter(f => {
        const name = f.name.toLowerCase();
        const path = f.path.toLowerCase();
        return (
            name.includes("route") ||
            name.includes("controller") ||
            ["app.js", "server.js", "app.py", "main.py"].includes(name) ||
            path.includes("/routes/") ||
            path.includes("/api/")
        );
    });

    for (const file of candidateFiles) {
        try {
            const fullPath = `${baseDirPath}/${file.path}`;
            const content = await fs.readFile(fullPath, "utf-8");

            // Regex for common route definitions
            // JS: app.get('/...', router.post('/...', etc.
            const jsRouteRegex = /\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
            let match;
            while ((match = jsRouteRegex.exec(content)) !== null) {
                routes.push({
                    method: match[1].toUpperCase(),
                    path: match[2],
                    file: file.path
                });
            }

            // Python (FastAPI/Flask): @app.get("/...")
            const pyRouteRegex = /@.*\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
            while ((match = pyRouteRegex.exec(content)) !== null) {
                routes.push({
                    method: match[1].toUpperCase(),
                    path: match[2],
                    file: file.path
                });
            }
        } catch (err) {
            console.error(`Error reading file for route detection: ${file.path}`, err);
        }
    }

    // De-duplicate routes
    return routes.filter((route, index, self) =>
        index === self.findIndex((r) => r.method === route.method && r.path === route.path)
    );
}

module.exports = detectRoutes;
