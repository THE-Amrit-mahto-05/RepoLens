const fastify = require("fastify")({ logger: true });
const fs = require("fs-extra");
const path = require("path");
const cloneRepo = require("./cloneRepo");
const scanFiles = require("./scanFiles");
const detectProject = require("./projectDetector");
const detectEntryPoints = require("./entryPointDetector");
const detectRoutes = require("./routeDetector");
const scoreRelevance = require("./relevanceScorer");
const detectRisks = require("./riskDetector");
const detectDependencies = require("./dependencyDetector");

fastify.register(require("@fastify/cors"), {
    origin: ["http://localhost:5173", "http://localhost:5174"]
});

fastify.get("/", async (request, reply) => {
    const { repo } = request.query;
    const clientUrl = repo ? `http://localhost:5173?repo=${encodeURIComponent(repo)}` : "http://localhost:5173";
    const appName = repo ? repo.split('/').pop().replace('.git', '') : "Virtual Host";

    let fileListHtml = "";
    if (repo) {
        try {
            const repoPath = path.join(__dirname, "../repos", appName);
            if (await fs.pathExists(repoPath)) {
                // Reuse scanFiles to get the list
                const files = await scanFiles(repoPath);

                fileListHtml = `
                    <div class="file-browser">
                        <h3>📂 Repository Files</h3>
                        <div class="file-list">
                            ${files.map(f => `
                                <div class="file-item">
                                    <span class="file-icon">📄</span>
                                    <a href="/view?repo=${encodeURIComponent(repo)}&file=${encodeURIComponent(f.path)}">${f.path}</a>
                                    <span class="file-size">(${(f.size / 1024).toFixed(1)} KB)</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                fileListHtml = `<div class="error">⚠️ Repository not found in sandbox (clone it first via the Analyze button)</div>`;
            }
        } catch (err) {
            fileListHtml = `<div class="error">⚠️ Error loading files: ${err.message}</div>`;
        }
    }

    reply.type("text/html");
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>RepoLens Virtual Sandbox</title>
        <style>
            body { background-color: #0d1117; color: #c9d1d9; font-family: 'Courier New', Courier, monospace; display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .container { text-align: center; border: 1px solid #30363d; padding: 40px; border-radius: 12px; background: #161b22; box-shadow: 0 0 20px rgba(0,0,0,0.5); width: 100%; max-width: 800px; }
            h1 { color: #58a6ff; margin-bottom: 10px; }
            .status { display: inline-block; padding: 5px 12px; border-radius: 20px; background: #2ea04330; color: #3fb950; border: 1px solid #2ea043; font-size: 14px; margin-bottom: 30px; }
            .info { color: #8b949e; margin-bottom: 20px; font-size: 14px; }
            .blink { animation: blinker 1s linear infinite; }
            @keyframes blinker { 50% { opacity: 0; } }
            a { color: #58a6ff; text-decoration: none; border-bottom: 1px dashed #58a6ff; transition: all 0.2s; }
            a:hover { color: #79c0ff; border-bottom-style: solid; }
            
            /* File Browser Styles */
            .file-browser { margin-top: 30px; text-align: left; border-top: 1px solid #30363d; padding-top: 20px; }
            .file-browser h3 { color: #c9d1d9; font-size: 16px; margin-bottom: 15px; border-bottom: 1px solid #30363d; padding-bottom: 10px; }
            .file-list { max-height: 400px; overflow-y: auto; background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 10px; }
            .file-item { display: flex; align-items: center; padding: 6px 10px; border-bottom: 1px solid #21262d; }
            .file-item:last-child { border-bottom: none; }
            .file-item:hover { background-color: #161b22; }
            .file-icon { margin-right: 10px; opacity: 0.7; }
            .file-item a { flex: 1; border: none; color: #c9d1d9; text-decoration: none; font-size: 13px; }
            .file-item a:hover { color: #58a6ff; text-decoration: underline; }
            .file-size { font-size: 11px; color: #8b949e; margin-left: 10px; }
            .error { color: #f85149; margin-top: 20px; padding: 10px; border: 1px solid #f85149; border-radius: 6px; background: rgba(248, 81, 73, 0.1); }

            /* Scrollbar */
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { background: #0d1117; }
            ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
            ::-webkit-scrollbar-thumb:hover { background: #484f58; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Virtual Host: 3000</h1>
            <div class="status">● System Active</div>
            <p class="info">Simulating environment for: <span style="color: #e6edf3;">${appName}</span></p>
            <p class="info">Gateway Status: <span style="color: #58a6ff">LISTENING</span> <span class="blink">_</span></p>
            
            ${fileListHtml}

            <div style="margin-top: 40px; font-size: 12px; color: #484f58;">
                Generated by <a href="${clientUrl}">RepoLens Intelligence Engine</a>
            </div>
        </div>
    </body>
    </html>
    `;
});

fastify.get("/view", async (request, reply) => {
    const { repo, file } = request.query;
    if (!repo || !file) return reply.code(400).send("Missing repo or file param");

    const appName = repo.split('/').pop().replace('.git', '');
    // Security: Prevent directory traversal
    const safeFile = file.replace(/\.\./g, '');
    const filePath = path.join(__dirname, "../repos", appName, safeFile);

    try {
        if (!await fs.pathExists(filePath)) return reply.code(404).send("File not found");

        const content = await fs.readFile(filePath, 'utf8');

        // Simple HTML escaping
        const escapedContent = content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        reply.type("text/html");
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${safeFile} - RepoLens</title>
            <style>
                body { background-color: #0d1117; color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; margin: 0; display: flex; flex-direction: column; height: 100vh; }
                header { background: #161b22; border-bottom: 1px solid #30363d; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
                h2 { margin: 0; font-size: 16px; font-weight: normal; font-family: 'Courier New', monospace; color: #58a6ff; }
                .back-btn { background: #21262d; border: 1px solid #30363d; color: #c9d1d9; padding: 5px 12px; border-radius: 6px; text-decoration: none; font-size: 13px; transition: 0.2s; }
                .back-btn:hover { background: #30363d; border-color: #8b949e; text-decoration: none; color: #fff; }
                pre { margin: 0; padding: 20px; overflow: auto; flex: 1; font-family: 'Courier New', Courier, monospace; font-size: 13px; line-height: 1.5; color: #c9d1d9; }
                /* Scrollbar */
                ::-webkit-scrollbar { width: 10px; height: 10px; }
                ::-webkit-scrollbar-track { background: #0d1117; }
                ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 5px; }
                ::-webkit-scrollbar-thumb:hover { background: #484f58; }
            </style>
        </head>
        <body>
            <header>
                <h2>${safeFile}</h2>
                <a href="/?repo=${encodeURIComponent(repo)}" class="back-btn">← Back to File Browser</a>
            </header>
            <pre><code>${escapedContent}</code></pre>
        </body>
        </html>
        `;
    } catch (err) {
        return reply.code(500).send(`Error reading file: ${err.message}`);
    }
});

fastify.post("/api/analyze", async (request, reply) => {
    const { repoUrl } = request.body;
    if (!repoUrl) {
        return reply.code(400).send({ error: "Repo Url is required" });
    }

    try {
        // Phase 1: Clone
        const repo = await cloneRepo(repoUrl);

        // Phase 2: Scan & Filter
        const rawFiles = await scanFiles(repo.path);

        // Phase 3: Project & Framework Detection
        const projectInfo = detectProject(rawFiles);

        // Phase 3.2: Entry Point Detection
        const entryPoints = detectEntryPoints(rawFiles, projectInfo);

        // Phase 4: Route Detection
        const routes = await detectRoutes(rawFiles, repo.path);

        // Phase 6: Relevance Ranking
        const rankedFiles = scoreRelevance(rawFiles, entryPoints);

        // Phase 5: Risk Detection
        const risks = await detectRisks(rawFiles, repo.path);

        // Phase 7: Dependency Analysis
        const dependencies = await detectDependencies(rawFiles, repo.path);

        return reply.send({
            repository: repo.name,
            projectType: projectInfo.projectType,
            framework: projectInfo.framework,
            entryPoints: entryPoints,
            routes: routes,
            risks: risks,
            dependencies: dependencies,
            fileCount: rankedFiles.length,
            importantFiles: rankedFiles.slice(0, 10), // Top 10 files
            allFiles: rankedFiles
        });
    } catch (error) {
        console.error("Analysis Error:", error);
        return reply.code(500).send({
            error: "Failed to analyze repository",
            message: error.message,
        });
    }
});

// API: Get raw file content (JSON)
fastify.get("/api/file", async (request, reply) => {
    const { repo, file } = request.query;
    if (!repo || !file) return reply.code(400).send({ error: "Missing repo or file param" });

    const appName = repo.split('/').pop().replace('.git', '');
    const safeFile = file.replace(/\.\./g, '');
    const filePath = path.join(__dirname, "../repos", appName, safeFile);

    try {
        if (!await fs.pathExists(filePath)) return reply.code(404).send({ error: "File not found" });
        const content = await fs.readFile(filePath, 'utf8');
        return reply.send({ file: safeFile, content });
    } catch (err) {
        return reply.code(500).send({ error: `Error reading file: ${err.message}` });
    }
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: "0.0.0.0" });
        console.log("server running on http://localhost:3000");
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

start();
