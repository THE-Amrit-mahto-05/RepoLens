import React, { useMemo, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import {
  FileCode,
  Map as MapIcon,
  GitBranch,
  ChevronRight,
  Box,
  ExternalLink,
  Info,
  X
} from 'lucide-react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 180;
const nodeHeight = 50;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === 'LR' ? Position.Left : Position.Top;
    node.sourcePosition = direction === 'LR' ? Position.Right : Position.Bottom;

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

// Custom Node for a more "fantastic" look
const CustomFileNode = ({ data, targetPosition, sourcePosition }) => {
  return (
    <div className={`px-4 py-2 shadow-sm rounded-md border-2 bg-white transition-all hover:shadow-md ${data.isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-200'}`}>
      <Handle type="target" position={targetPosition || Position.Top} className="w-1.5 h-1.5 !bg-gray-300 !border-none" />
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded ${data.colorClass || 'bg-gray-50 text-gray-400'}`}>
          {data.icon || <FileCode size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate leading-none mb-1">
            {data.type}
          </p>
          <p className="text-xs font-semibold text-gray-800 truncate">
            {data.label}
          </p>
        </div>
      </div>
      <Handle type="source" position={sourcePosition || Position.Bottom} className="w-1.5 h-1.5 !bg-gray-300 !border-none" />
    </div>
  );
};

const nodeTypes = {
  customFile: CustomFileNode,
};

export default function ArchitectureDiagram({ entryPoints = [], importantFiles = [], routes = [], dependencies = [], repoUrl }) {
  const [activeDiagram, setActiveDiagram] = useState('flow'); // flow, routes, structure
  const [previewFile, setPreviewFile] = useState(null);
  const [code, setCode] = useState(null);
  const [loadingCode, setLoadingCode] = useState(false);

  const fetchCode = async (filePath) => {
    setPreviewFile(filePath);
    setLoadingCode(true);
    setCode(null);
    try {
      const res = await fetch(`https://repolens-1.onrender.com/api/file?repo=${encodeURIComponent(repoUrl)}&file=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      setCode(data.content);
    } catch (err) {
      console.error(err);
      setCode("// Error loading file");
    } finally {
      setLoadingCode(false);
    }
  };

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    let nodes = [];
    let edges = [];

    if (activeDiagram === 'routes') {
      // Routes Map View
      nodes = routes.map((r, i) => ({
        id: `route-${i}`,
        type: 'customFile',
        data: {
          label: r.path,
          type: r.method,
          colorClass: r.method === 'GET' ? 'bg-blue-50 text-blue-600' :
            r.method === 'POST' ? 'bg-green-50 text-green-600' :
              'bg-yellow-50 text-yellow-600',
          icon: <MapIcon size={14} />
        },
        position: { x: 0, y: 0 }
      }));
      // Connect routes to their files if they exist in importantFiles
      routes.forEach((r, i) => {
        if (r.file) {
          const fileNodeId = `file-${r.file}`;
          if (!nodes.find(n => n.id === fileNodeId)) {
            nodes.push({
              id: fileNodeId,
              type: 'customFile',
              data: { label: r.file.split('/').pop(), type: 'Handler', colorClass: 'bg-purple-50 text-purple-600', path: r.file },
              position: { x: 0, y: 0 }
            });
          }
          edges.push({ id: `e-r-${i}`, source: `route-${i}`, target: fileNodeId, animated: true });
        }
      });
    } else if (activeDiagram === 'flow') {
      // Component Flow View (Using actual dependencies)
      const visibleFiles = new Set();
      dependencies.slice(0, 30).forEach(d => {
        visibleFiles.add(d.source);
        visibleFiles.add(d.target);
      });

      Array.from(visibleFiles).forEach(f => {
        const isEntry = entryPoints.some(ep => ep.path === f);
        nodes.push({
          id: f,
          type: 'customFile',
          data: {
            label: f.split('/').pop(),
            type: isEntry ? 'Entry Point' : 'Module',
            colorClass: isEntry ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500',
            path: f
          },
          position: { x: 0, y: 0 }
        });
      });

      dependencies.slice(0, 30).forEach((d, i) => {
        edges.push({ id: `e-d-${i}`, source: d.source, target: d.target, animated: true, style: { stroke: '#3b82f6', strokeWidth: 1 } });
      });

      if (nodes.length === 0) {
        // Fallback to important files if no deps
        importantFiles.slice(0, 10).forEach(f => {
          nodes.push({
            id: f.path,
            type: 'customFile',
            data: { label: f.name, type: 'File', colorClass: 'bg-gray-50' },
            position: { x: 0, y: 0 }
          });
        });
      }
    } else {
      // Simple Tree View
      importantFiles.forEach(f => {
        nodes.push({
          id: f.path,
          type: 'customFile',
          data: { label: f.name, type: f.type || 'File', colorClass: 'bg-gray-50', path: f.path },
          position: { x: 0, y: 0 }
        });
      });
    }

    return getLayoutedElements(nodes, edges, activeDiagram === 'routes' ? 'LR' : 'TB');
  }, [activeDiagram, routes, importantFiles, dependencies, entryPoints]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes/edges when initial calculations change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    if (node.data.path) {
      fetchCode(node.data.path);
    }
  }, [fetchCode]);

  return (
    <div className="relative h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 bg-gray-50/50 p-1 gap-1">
        {[
          { id: 'flow', label: 'Component Flow', icon: GitBranch },
          { id: 'routes', label: 'Route Map', icon: MapIcon },
          { id: 'structure', label: 'Key Components', icon: Box },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveDiagram(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeDiagram === tab.id
              ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Flow Canvas */}
      <div className="flex-1 bg-gray-50/30">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          className="bg-dots-pattern"
        >
          <Background color="#e5e7eb" gap={20} size={1} />
          <Controls showInteractive={false} className="shadow-sm border-none" />
        </ReactFlow>
      </div>

      {/* Legend & Instructions */}
      <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Interactive Map</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Click nodes to view source
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              Scroll to zoom
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded">
          <Info size={10} />
          <span>Auto-layout active</span>
        </div>
      </div>

      {/* Code Preview Sidebar (Modal-like overlay) */}
      {previewFile && (
        <div className="absolute inset-x-4 bottom-4 top-14 bg-white shadow-2xl rounded-xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-slide-in">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <FileCode size={18} className="text-blue-500" />
              <div>
                <h3 className="text-sm font-bold text-gray-800">{previewFile.split('/').pop()}</h3>
                <p className="text-[10px] text-gray-400 font-mono truncate max-w-[300px]">{previewFile}</p>
              </div>
            </div>
            <button onClick={() => setPreviewFile(null)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-gray-900">
            {loadingCode ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Fetching source...</span>
              </div>
            ) : (
              <pre className="p-6 text-xs font-mono text-gray-300 leading-relaxed whitespace-pre">
                {code}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
