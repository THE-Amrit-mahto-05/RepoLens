import { useState, useEffect } from "react";
import {
  Search,
  FileCode,
  Layers,
  Database,
  ArrowRight,
  Github,
  Terminal,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Info,
  Code,
  Layout,
  Server,
  GitBranch,
  RefreshCw,
  CheckCircle,
  Shuffle,
  ExternalLink,
} from "lucide-react";
import FileTree from "./components/FileTree";
import ArchitectureDiagram from "./components/ArchitectureDiagram";

// Helper: HTTP method badge class
const methodBadgeClass = (method) => {
  switch (method?.toUpperCase()) {
    case "GET": return "method-badge method-get";
    case "POST": return "method-badge method-post";
    case "PUT": return "method-badge method-put";
    case "PATCH": return "method-badge method-patch";
    case "DELETE": return "method-badge method-delete";
    default: return "method-badge method-other";
  }
};

// Helper: file extension badge
const ExtBadge = ({ path }) => {
  const ext = path?.split(".").pop()?.toLowerCase() || "";
  if (!ext || ext === path) return null;
  return <span className="ext-badge">.{ext}</span>;
};

// Clickable risk item with code preview
const RiskItem = ({ risk, repoUrl }) => {
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState(null);
  const [loadingCode, setLoadingCode] = useState(false);
  const [codeError, setCodeError] = useState(null);

  const isFile = risk.file && risk.file !== "Project Root";

  const handleClick = async () => {
    if (!isFile) return;
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (code) return; // already loaded
    setLoadingCode(true);
    setCodeError(null);
    try {
      const res = await fetch(
        `http://localhost:3000/api/file?repo=${encodeURIComponent(repoUrl)}&file=${encodeURIComponent(risk.file)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load file");
      setCode(data.content);
    } catch (err) {
      setCodeError(err.message);
    } finally {
      setLoadingCode(false);
    }
  };

  const bgColor = risk.severity === "high" ? "#fef2f2" : risk.severity === "medium" ? "#fffbeb" : "#f9fafb";
  const borderColor = risk.severity === "high" ? "#fee2e2" : risk.severity === "medium" ? "#fef3c7" : "#e5e7eb";
  const textColor = risk.severity === "high" ? "#991b1b" : risk.severity === "medium" ? "#92400e" : "#374151";

  return (
    <div className="animate-slide-in">
      <div
        className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${isFile ? "cursor-pointer" : ""}`}
        style={{ backgroundColor: bgColor, borderColor, color: textColor }}
        onClick={handleClick}
      >
        {risk.severity === "high" ? (
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        ) : (
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-snug">{risk.reason}</p>
          <p className="text-[11px] opacity-60 truncate mt-0.5 font-mono">{risk.file}</p>
        </div>
        {isFile && (
          <span className="text-[10px] opacity-50 shrink-0 self-center">
            {expanded ? "hide" : "view code"}
          </span>
        )}
      </div>
      {expanded && (
        <div className="mt-1 rounded-lg overflow-hidden border border-gray-200">
          {loadingCode && (
            <div className="p-4 text-xs text-gray-400 bg-gray-50 text-center">Loading file...</div>
          )}
          {codeError && (
            <div className="p-4 text-xs text-red-500 bg-red-50 text-center">{codeError}</div>
          )}
          {code && (
            <pre className="bg-gray-900 text-gray-200 p-4 text-xs font-mono overflow-auto max-h-[350px] leading-relaxed whitespace-pre">
              {code}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const repoParam = params.get("repo");
    if (repoParam) {
      setRepoUrl(repoParam);
      analyzeRepo(repoParam);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const analyzeRepo = async (url = repoUrl) => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to analyze repository");
      setResult(data);
      setActiveTab("summary");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  // ─── Result Dashboard ────────────────────────────────────────────────────
  if (result && !loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-8 flex-1">
            {/* Logo */}
            <h1
              className="text-xl font-semibold cursor-pointer select-none tracking-tight flex-shrink-0"
              onClick={() => setResult(null)}
              title="Back to home"
            >
              <span className="text-[#4285F4]">R</span>
              <span className="text-[#EA4335]">e</span>
              <span className="text-[#FBBC05]">p</span>
              <span className="text-[#4285F4]">o</span>
              <span className="text-[#34A853]">L</span>
              <span className="text-[#EA4335]">e</span>
              <span className="text-[#FBBC05]">n</span>
              <span className="text-[#34A853]">s</span>
            </h1>
            {/* Search bar */}
            <div className="google-search-bar max-w-2xl h-10">
              <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <input
                className="flex-1 outline-none text-sm text-gray-800"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyzeRepo()}
                placeholder="Enter GitHub repository URL..."
              />
              <button
                onClick={() => analyzeRepo()}
                className="ml-2 text-[#1a73e8] hover:text-[#1557b0] transition-colors"
                title="Re-analyze"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {result.fileCount} files scanned
            </span>
            <a
              href={result.repository}
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 hover:text-gray-800 transition-colors"
              title="Open repository"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </header>

        <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-8 animate-fade-in">
          {/* Project Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="card">
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Project Type</p>
                <p className="text-base font-semibold text-gray-800 truncate">{result.projectType}</p>
              </div>
            </div>
            <div className="card">
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Framework</p>
                <p className="text-base font-semibold text-gray-800 truncate">{result.framework}</p>
              </div>
            </div>
            <div className="card">
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Entry Points</p>
                <p className="text-base font-semibold text-gray-800 truncate">
                  {result.entryPoints[0]?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {[
              { id: "summary", label: "Summary", icon: Info },
              { id: "files", label: "Key Files", icon: FileCode },
              { id: "routes", label: "Routes", icon: Layers },
              { id: "structure", label: "Structure", icon: GitBranch },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === tab.id
                  ? "text-[#1a73e8] border-[#1a73e8]"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <tab.icon size={15} />
                {tab.label}
                {tab.id === "routes" && result.routes.length > 0 && (
                  <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 rounded-full px-1.5 py-0.5 font-bold">
                    {result.routes.length}
                  </span>
                )}
                {tab.id === "files" && result.importantFiles.length > 0 && (
                  <span className="ml-1 text-[10px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 font-bold">
                    {result.importantFiles.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">

            {/* ── Summary ─────────────────────────────── */}
            {activeTab === "summary" && (
              <div className="space-y-6 animate-fade-in">
                {/* Repo overview */}
                <div className="card">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <Github size={18} className="text-gray-600" />
                      {result.repository}
                    </h3>
                    <a
                      href={result.repository}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-[#1a73e8] hover:underline flex items-center gap-1"
                    >
                      Open <ExternalLink size={10} />
                    </a>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5">
                    This is a{" "}
                    <span className="font-semibold text-gray-800">{result.projectType}</span> project
                    built with{" "}
                    <span className="font-semibold text-gray-800">{result.framework}</span>.
                    Scanned <span className="font-semibold">{result.fileCount}</span> files and
                    identified <span className="font-semibold">{result.routes.length}</span> API endpoints.
                  </p>

                  {/* Launch Commands */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm mb-3">
                      <ArrowRight size={15} />
                      Launch Commands
                    </div>
                    <div className="space-y-3">
                      {result.entryPoints.map((ep, i) => (
                        <div key={i} className="bg-white rounded-lg border border-blue-100 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                              {ep.type} Entry
                            </span>
                            <code className="text-[10px] text-gray-400 font-mono">{ep.path}</code>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-900 text-gray-100 p-2.5 rounded-md text-xs font-mono">
                            <span className="text-gray-500 select-none">&gt;</span>
                            <span>{ep.command}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Detectors */}
                  <div className="card">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">Project Details</h4>
                    <ul className="space-y-0 text-sm divide-y divide-gray-50">
                      <li className="flex justify-between items-center py-2">
                        <span className="text-gray-500">Language</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-700">
                          {result.framework || "Mixed"}
                        </span>
                      </li>
                      <li className="flex justify-between items-center py-2">
                        <span className="text-gray-500">Files Scanned</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-700">
                          {result.fileCount}
                        </span>
                      </li>
                      <li className="flex justify-between items-center py-2">
                        <span className="text-gray-500">Routes Detected</span>
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          {result.routes.length}
                        </span>
                      </li>
                      <li className="flex justify-between items-center py-2">
                        <span className="text-gray-500">Entry Points</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-700">
                          {result.entryPoints.length}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Risk Signals */}
                  <div className="card">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center">
                      Risk Signals
                      {result.risks?.length > 0 && (
                        <span className="ml-auto text-[10px] bg-red-50 text-red-600 border border-red-100 rounded-full px-2 py-0.5 font-bold">
                          {result.risks.length}
                        </span>
                      )}
                    </h4>
                    <div className="space-y-2">
                      {result.risks && result.risks.length > 0 ? (
                        result.risks.map((risk, i) => (
                          <RiskItem key={i} risk={risk} repoUrl={repoUrl} />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          <div className="bg-white p-2 rounded-full shadow-sm mb-2">
                            <CheckCircle size={18} className="text-[#34a853]" />
                          </div>
                          <p className="text-sm font-medium text-gray-600">No critical risks found</p>
                          <p className="text-xs mt-1 text-gray-400">Architecture looks solid</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Key Files ───────────────────────────── */}
            {activeTab === "files" && (
              <div className="space-y-2 animate-fade-in">
                {/* Table header */}
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  <span></span>
                  <span>File Path</span>
                  <span>Type</span>
                  <span className="text-right">Relevance</span>
                </div>
                {result.importantFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="card p-4 grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0">
                      <FileCode size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{file.path}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <ExtBadge path={file.path} />
                        <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded hidden md:inline">
                      {file.type}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden md:block">
                        <div
                          className="h-full rounded-full bg-[#34a853]"
                          style={{ width: `${Math.min(100, file.relevanceScore)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 w-7 text-right">
                        {Math.round(file.relevanceScore)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Routes ──────────────────────────────── */}
            {activeTab === "routes" && (
              <div className="card p-0 overflow-hidden animate-fade-in">
                {result.routes.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Method</th>
                        <th className="px-5 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Path</th>
                        <th className="px-5 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider hidden md:table-cell">Defined In</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.routes.map((route, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3">
                            <span className={methodBadgeClass(route.method)}>{route.method}</span>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-gray-800">{route.path}</td>
                          <td className="px-5 py-3 text-gray-400 text-xs truncate max-w-[220px] hidden md:table-cell">
                            {route.file}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <Layers size={32} className="mb-3 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">No routes detected</p>
                    <p className="text-xs mt-1">This project may not expose HTTP endpoints.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Structure & UML ─────────────────────── */}
            {activeTab === "structure" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ height: 600 }}>
                <div className="col-span-1 h-full">
                  <FileTree files={result.allFiles || result.importantFiles} />
                </div>
                <div className="col-span-1 lg:col-span-2 h-full">
                  <ArchitectureDiagram
                    entryPoints={result.entryPoints}
                    importantFiles={result.importantFiles}
                    routes={result.routes}
                    dependencies={result.dependencies}
                    repoUrl={repoUrl}
                  />
                </div>
              </div>
            )}
          </div>
        </main >
      </div >
    );
  }

  // ─── Landing Page ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-[12vh]">
      {/* Logo */}
      <h1 className="text-7xl font-semibold mb-3 select-none tracking-tight">
        <span className="text-[#4285F4]">R</span>
        <span className="text-[#EA4335]">e</span>
        <span className="text-[#FBBC05]">p</span>
        <span className="text-[#4285F4]">o</span>
        <span className="text-[#34A853]">L</span>
        <span className="text-[#EA4335]">e</span>
        <span className="text-[#FBBC05]">n</span>
        <span className="text-[#34A853]">s</span>
      </h1>


      <div className="w-full max-w-[584px] px-4 space-y-5">
        {/* Search */}
        <div className="google-search-bar h-12 shadow-sm hover:shadow-md transition-shadow">
          <Search className="text-gray-400 w-5 h-5 mr-3 flex-shrink-0" />
          <input
            className="flex-1 outline-none text-base text-gray-800"
            placeholder="Paste a GitHub repository URL..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeRepo()}
            autoFocus
          />
          {repoUrl && (
            <button
              onClick={() => setRepoUrl("")}
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm ml-1 px-1"
            >
              &times;
            </button>
          )}

        </div>

        {/* Button */}
        <div className="flex justify-center">
          <button
            onClick={() => analyzeRepo()}
            disabled={loading || !repoUrl}
            className="google-btn google-btn-primary min-w-[130px]"
          >
            <Search size={14} />
            {loading ? "Analyzing..." : "Analyze Repo"}
          </button>
        </div>

        {/* Inline loading text */}
        {loading && (
          <div className="mt-5 flex items-center justify-center gap-2 animate-fade-in">
            <span className="text-sm text-gray-500">Analyzing repository...</span>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm animate-fade-in">
            <AlertTriangle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>




    </div>
  );
}