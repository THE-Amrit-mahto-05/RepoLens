function detectEntryPoints(files, projectInfo) {
    const entryPoints = [];
    const fileNames = files.map(f => f.name);
    const { projectType, isBackend, isFrontend } = projectInfo;

    const backendSearch = ["server.js", "app.js", "index.js", "main.js", "main.c", "main.cpp"];
    const frontendSearch = ["index.jsx", "main.jsx", "App.jsx", "index.tsx", "main.tsx", "App.tsx", "index.html"];
    const pythonSearch = ["app.py", "main.py", "manage.py"];
    const javaSearch = ["Main.java", "Application.java"];
    if (isBackend) {
        if (projectType.includes("Node")) {
            const match = files.find(f => backendSearch.includes(f.name));
            if (match) {
                entryPoints.push({
                    name: "Backend Server",
                    path: match.path,
                    type: "Backend",
                    command: `node ${match.path}`
                });
            }
        } else if (projectType === "Python") {
            const match = files.find(f => pythonSearch.includes(f.name));
            if (match) {
                let cmd = `python ${match.path}`;
                if (match.name === "manage.py") cmd = "python manage.py runserver";
                entryPoints.push({
                    name: "Python App",
                    path: match.path,
                    type: "Backend",
                    command: cmd
                });
            }
        } else if (projectType === "C/C++ Project") {
            const match = files.find(f => f.name === "main.c" || f.name === "main.cpp" || f.path.includes("src/main"));
            if (match) {
                entryPoints.push({
                    name: "C/C++ Main",
                    path: match.path,
                    type: "Binary",
                    command: `gcc ${match.path} -o app && ./app`
                });
            }
        }
    }
    if (isFrontend) {
        const match = files.find(f => frontendSearch.includes(f.name));
        if (match) {
            let cmd = "npm run dev"; 
            if (fileNames.includes("next.config.js")) cmd = "npm run dev";

            entryPoints.push({
                name: "Frontend App",
                path: match.path,
                type: "Frontend",
                command: cmd
            });
        }
    }
    if (entryPoints.length === 0) {
        const fallback = files.find(f => f.path.includes("index.") || f.path.includes("main."));
        if (fallback) {
            entryPoints.push({
                name: "Main Entry",
                path: fallback.path,
                type: "General",
                command: fallback.extension === ".py" ? `python ${fallback.path}` : `node ${fallback.path}`
            });
        }
    }

    return entryPoints;
}

module.exports = detectEntryPoints;
