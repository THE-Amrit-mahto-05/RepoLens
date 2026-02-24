import { useState, useEffect } from "react";
import {
  Search,
  FileCode,
  Settings,
  Layers,
  Database,
  ArrowRight,
  ChevronRight,
  Github,
  Terminal,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Activity,
  Info,
  Code,
  Layout,
  Server,
  Zap,
  Cpu,
  HardDrive,
  Monitor,
  CheckCircle,
  Clock,
  ExternalLink,
  GitBranch
} from "lucide-react";
import FileTree from "./components/FileTree";
import ArchitectureDiagram from "./components/ArchitectureDiagram";

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
  }, []);

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

  const handleSurpriseMe = () => {
    const repos = [
      "https://github.com/expressjs/express",
      "https://github.com/facebook/react",
      "https://github.com/django/django",
    ];
    const randomRepo = repos[Math.floor(Math.random() * repos.length)];
    setRepoUrl(randomRepo);
    analyzeRepo(randomRepo);
  };

  if (result && !loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Dashboard Header */}
        <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-8 flex-1">
            <h1 className="text-xl font-medium cursor-pointer" onClick={() => setResult(null)}>
              <span className="text-[#4285F4]">R</span>
              <span className="text-[#EA4335]">e</span>
              <span className="text-[#FBBC05]">p</span>
              <span className="text-[#4285F4]">o</span>
              <span className="text-[#34A853]">L</span>
              <span className="text-[#EA4335]">e</span>
              <span className="text-[#FBBC05]">n</span>
              <span className="text-[#34A853]">s</span>
            </h1>
            <div className="google-search-bar max-w-2xl h-10">
              <input
                className="flex-1 outline-none text-sm"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyzeRepo()}
              />
              <Search className="w-4 h-4 text-gray-400 cursor-pointer" onClick={() => analyzeRepo()} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500">
              {result.fileCount} files analyzed
            </div>
            <Github className="w-5 h-5 text-gray-600" />
          </div>
        </header>

        <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full p-8 animate-fade-in">
          {/* Project Overview Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-[#1a73e8]">
                {result.projectType?.includes("Frontend") ? <Layout size={24} /> : <Server size={24} />}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Project Type</p>
                <p className="text-lg font-medium">{result.projectType}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg text-[#34a853]">
                <Code size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Framework</p>
                <p className="text-lg font-medium">{result.framework}</p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="p-3 bg-yellow-50 rounded-lg text-[#fbbc05]">
                <Terminal size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Entry Points</p>
                <p className="text-lg font-medium truncate max-w-[150px]">{result.entryPoints[0]?.name || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6 px-2">
            {[
              { id: "summary", label: "Analysis Summary", icon: Info },
              { id: "files", label: "Top Important Files", icon: FileCode },
              { id: "routes", label: "Route Map", icon: Layers },
              { id: "structure", label: "Structure & UML", icon: GitBranch }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${activeTab === tab.id
                  ? "text-[#1a73e8] border-b-2 border-[#1a73e8]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {activeTab === "summary" && (
              <div className="space-y-6 animate-fade-in">
                <div className="card">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Github size={20} className="text-gray-700" />
                    Repository: <span className="text-[#1a73e8]">{result.repository}</span>
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    This is a {result.projectType} project built using <span className="font-bold">{result.framework}</span>.
                    We've scanned {result.fileCount} relevant files and identified {result.routes.length} key endpoints.
                  </p>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex items-center gap-2 text-blue-800 font-medium mb-3">
                      <ArrowRight size={16} />
                      Where to start? (Launch Commands)
                    </div>
                    <div className="space-y-4">
                      {result.entryPoints.map((ep, i) => (
                        <div key={i} className="bg-white/50 p-3 rounded border border-blue-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{ep.type} Entry</span>
                            <code className="text-[10px] text-gray-500">{ep.path}</code>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-900 text-gray-100 p-2 rounded text-xs font-mono">
                            <span className="text-gray-500">$</span>
                            <span>{ep.command}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Terminal size={18} className="text-gray-500" /> Detectors
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500">Language Distribution</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">Mixed</span>
                      </li>
                      <li className="flex justify-between items-center py-2 border-b border-gray-50">
                        <span className="text-gray-500">Root Directory</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs text-right truncate max-w-[150px]">/</span>
                      </li>
                    </ul>
                  </div>
                  <div className="card">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <ShieldAlert size={18} className="text-gray-500" /> Risk Signals
                    </h4>
                    <div className="space-y-3">
                      {result.risks && result.risks.length > 0 ? result.risks.map((risk, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-3 rounded-lg border leading-tight animate-fade-in`}
                          style={{
                            backgroundColor: risk.severity === 'high' ? '#fef2f2' : risk.severity === 'medium' ? '#fffbeb' : '#f8f9fa',
                            borderColor: risk.severity === 'high' ? '#fee2e2' : risk.severity === 'medium' ? '#fef3c7' : '#dadce0',
                            color: risk.severity === 'high' ? '#991b1b' : risk.severity === 'medium' ? '#92400e' : '#3c4043'
                          }}
                        >
                          {risk.severity === 'high' ? (
                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 overflow-hidden">
                            <p className="font-semibold text-sm">{risk.reason}</p>
                            <p className="text-[11px] opacity-70 truncate mt-0.5">
                              {risk.file}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center justify-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          <div className="bg-white p-2 rounded-full shadow-sm mb-2">
                            <ShieldAlert size={20} className="text-[#34a853]" />
                          </div>
                          <p className="text-sm font-medium">No critical risks found</p>
                          <p className="text-[11px] mt-1">Architecture looks solid</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "files" && (
              <div className="space-y-4 animate-fade-in">
                {result.importantFiles.map((file, idx) => (
                  <div key={idx} className="card p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                        <FileCode size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{file.path}</p>
                        <p className="text-xs text-gray-500">{file.type} • {(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden hidden md:block">
                        <div
                          className="h-full bg-[#34a853]"
                          style={{ width: `${Math.min(100, file.relevanceScore)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 w-8">{Math.round(file.relevanceScore)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "routes" && (
              <div className="card p-0 overflow-hidden animate-fade-in">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-medium text-gray-700">Method</th>
                      <th className="px-6 py-4 font-medium text-gray-700">Path</th>
                      <th className="px-6 py-4 font-medium text-gray-700">Defined In</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.routes.length > 0 ? result.routes.map((route, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${route.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                            route.method === 'POST' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {route.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-800">{route.path}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-[200px]">{route.file}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-gray-400 italic">
                          No routes detected in the source code.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "structure" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] animate-fade-in">
                <div className="col-span-1 h-full">
                  <FileTree files={result.allFiles || result.importantFiles} />
                </div>
                <div className="col-span-1 lg:col-span-2 h-full">
                  <ArchitectureDiagram
                    entryPoints={result.entryPoints}
                    importantFiles={result.importantFiles}
                    routes={result.routes}
                  />
                </div>
              </div>
            )}
          </div>
        </main >
      </div >
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-[15vh]">
      {/* Landing Layout */}
      <h1 className="text-7xl font-semibold mb-8 select-none tracking-tight">
        <span className="text-[#4285F4]">R</span>
        <span className="text-[#EA4335]">e</span>
        <span className="text-[#FBBC05]">p</span>
        <span className="text-[#4285F4]">o</span>
        <span className="text-[#34A853]">L</span>
        <span className="text-[#EA4335]">e</span>
        <span className="text-[#FBBC05]">n</span>
        <span className="text-[#34A853]">s</span>
      </h1>

      <div className="w-full max-w-[584px] px-4 space-y-6">
        <div className="google-search-bar h-12 shadow-sm hover:shadow-md transition-shadow">
          <Search className="text-gray-400 w-5 h-5 mr-3" />
          <input
            className="flex-1 outline-none text-base"
            placeholder="Search or paste a GitHub repository URL..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeRepo()}
          />
          <Github className="text-gray-400 w-5 h-5 ml-2 cursor-pointer" />
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => analyzeRepo()}
            disabled={loading}
            className="google-btn min-w-[120px]"
          >
            {loading ? "Analyzing..." : "Repo Analysis"}
          </button>
          <button
            onClick={handleSurpriseMe}
            className="google-btn min-w-[120px]"
          >
            I'm Feeling Lucky
          </button>
        </div>

        {error && (
          <div className="mt-8 bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg flex items-center gap-3 text-sm animate-fade-in">
            <ShieldAlert size={20} />
            {error}
          </div>
        )}
      </div>

      <footer className="mt-auto py-6 text-xs text-gray-500 flex gap-6">
        <span>RepoLens Search</span>
        <span>Developer Console</span>
        <span>Settings</span>
      </footer>

      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Cloning and Analyzing Intelligence Map...</p>
        </div>
      )}
    </div>
  );
}