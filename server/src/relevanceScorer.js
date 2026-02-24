function scoreRelevance(files, entryPoints) {
    return files.map(file => {
        let score = 0;
        const name = file.name.toLowerCase();
        const path = file.path.toLowerCase();

        // 1. Check if it's an entry point
        if (entryPoints.includes(file.path)) {
            score += 100;
        }

        // 2. File Name patterns
        if (name.includes("server") || name.includes("app") || name.includes("index")) score += 50;
        if (name.includes("route") || name.includes("controller") || name.includes("service")) score += 40;
        if (name.includes("config") || name.includes("env")) score += 20;

        // 3. Path patterns
        if (path.includes("src/routes") || path.includes("src/controllers") || path.includes("src/services")) score += 30;
        if (path.includes("api/")) score += 20;

        // 4. File Type
        const sourceExtensions = [".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".go"];
        if (sourceExtensions.includes(file.extension)) {
            score += 10;
        } else if (file.type === "JSON" || file.type === "YAML") {
            score += 5;
        }

        // 5. Depth (higher relevance for shallower files)
        const depth = file.path.split("/").length;
        score += Math.max(0, 20 - (depth * 5));

        return {
            ...file,
            relevanceScore: score
        };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

module.exports = scoreRelevance;
