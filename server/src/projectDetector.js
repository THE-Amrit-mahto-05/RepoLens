const path = require("path");

function detectProject(files) {
    let projectType = "Unknown";
    let framework = "None";
    let isBackend = false;
    let isFrontend = false;

    const fileNames = files.map(f => f.name);
    const hasFile = (name) => fileNames.includes(name);

    if (hasFile("package.json")) {
        projectType = "Node.js";
        if (hasFile("index.html") || files.some(f => f.path.startsWith("src") && (f.name.includes("App") || f.extension === ".jsx" || f.extension === ".tsx"))) {
            isFrontend = true;
        }
        if (files.some(f => f.name === "server.js" || f.name === "app.js" || f.path.includes("routes") || f.path.includes("api"))) {
            isBackend = true;
        }
    } else if (hasFile("requirements.txt") || hasFile("pyproject.toml") || hasFile("manage.py")) {
        projectType = "Python";
        isBackend = true;
    } else if (hasFile("pom.xml") || hasFile("build.gradle")) {
        projectType = "Java";
        isBackend = true;
    } else if (hasFile("go.mod")) {
        projectType = "Go";
        isBackend = true;
    } else if (hasFile("Makefile") || hasFile("CMakeLists.txt") || files.some(f => f.extension === ".c" || f.extension === ".cpp" || f.extension === ".h")) {
        projectType = "C/C++ Project";
        isBackend = true;
    } else if (hasFile("Dockerfile")) {
        projectType = "Dockerized Project";
    }

    if (isBackend && isFrontend) {
        projectType = "Fullstack (Node)";
    } else if (isFrontend) {
        projectType = "Frontend (Node)";
    } else if (isBackend && projectType === "Node.js") {
        projectType = "Backend (Node)";
    } else if (isBackend && projectType === "C/C++ Project") {
        framework = hasFile("CMakeLists.txt") ? "CMake" : "Makefile";
    }

    if (projectType.includes("Node")) {
        if (files.some(f => f.name.includes("App.jsx") || f.name.includes("App.tsx"))) framework = "React";
        if (hasFile("next.config.js") || hasFile("next.config.mjs")) framework = "Next.js";
        if (hasFile("nuxt.config.js") || hasFile("nuxt.config.ts")) framework = "Nuxt.js";
        if (files.some(f => f.name === "server.js" || f.name === "app.js") && (framework === "None" || framework === "React")) framework = framework === "React" ? "React + Express" : "Express/Node";
    } else if (projectType === "Python") {
        if (hasFile("manage.py")) framework = "Django";
        if (files.some(f => f.name.includes("app.py") || f.name.includes("main.py"))) framework = "Flask/FastAPI";
    }

    return { projectType, framework, isBackend, isFrontend };
}

module.exports = detectProject;
