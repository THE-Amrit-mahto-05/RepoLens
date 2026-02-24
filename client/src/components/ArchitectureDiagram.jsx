import React, { useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { User, Server, Database, Code, ArrowRight, Layers, Box } from 'lucide-react';

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

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
    node.targetPosition = direction === 'LR' ? 'left' : 'top';
    node.sourcePosition = direction === 'LR' ? 'right' : 'bottom';

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

export default function ArchitectureDiagram({ entryPoints = [], importantFiles = [], routes = [] }) {
  const [nodes, setNodes] = React.useState([]);
  const [edges, setEdges] = React.useState([]);
  const [activeDiagram, setActiveDiagram] = React.useState('usecase');

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const generateUseCaseGraph = useCallback(() => {
    const newNodes = [];
    const newEdges = [];

    // Actor Node
    newNodes.push({
      id: 'user',
      data: { label: 'User / Client' },
      position: { x: 0, y: 0 },
      style: { background: '#fff', border: '1px solid #777', borderRadius: '50%', width: 80, height: 80, display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }
    });

    // Route Nodes
    routes.slice(0, 10).forEach((route, i) => {
      const id = `route-${i}`;
      newNodes.push({
        id,
        data: { label: `${route.method} ${route.path}` },
        position: { x: 0, y: 0 },
        style: { background: '#e8f0fe', border: '1px solid #4285f4', borderRadius: '20px', fontSize: '12px' }
      });
      newEdges.push({
        id: `e-user-${id}`,
        source: 'user',
        target: id,
        markerEnd: { type: MarkerType.ArrowClosed },
        animated: true,
      });
    });

    if (routes.length === 0) {
      // Fallback if no routes
      const id = 'route-default';
      newNodes.push({
        id,
        data: { label: 'View Application' },
        position: { x: 0, y: 0 },
        style: { background: '#e8f0fe', border: '1px solid #4285f4', borderRadius: '20px', fontSize: '12px' }
      });
      newEdges.push({
        id: `e-user-${id}`,
        source: 'user',
        target: id,
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    }

    return getLayoutedElements(newNodes, newEdges, 'LR');
  }, [routes]);

  const generateSequenceGraph = useCallback(() => {
    const newNodes = [];
    const newEdges = [];

    // 1. User
    newNodes.push({ id: 'user', data: { label: 'User Action' }, position: { x: 0, y: 0 }, style: { background: '#f3f4f6', border: '1px dashed #999', borderRadius: '4px' } });

    // 2. Client Entry
    const entryName = entryPoints[0]?.name || 'App.jsx';
    newNodes.push({ id: 'client', data: { label: `Client (${entryName})` }, position: { x: 0, y: 0 }, style: { background: '#dcfce7', border: '1px solid #22c55e', borderRadius: '4px' } });

    // 3. API
    newNodes.push({ id: 'api', data: { label: 'API Handler' }, position: { x: 0, y: 0 }, style: { background: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '4px' } });

    // 4. Logic/DB
    const hasDB = importantFiles.some(f => f.path.includes('model') || f.path.includes('db'));
    if (hasDB) {
      newNodes.push({ id: 'db', data: { label: 'Database / Model' }, position: { x: 0, y: 0 }, style: { background: '#ffedd5', border: '1px solid #f97316', borderRadius: '4px' } });
      newEdges.push({ id: 'e3', source: 'api', target: 'db', label: 'Query', markerEnd: { type: MarkerType.ArrowClosed }, animated: true });
      newEdges.push({ id: 'e4', source: 'db', target: 'api', label: 'Result', markerEnd: { type: MarkerType.ArrowClosed }, animated: true, style: { strokeDasharray: '5,5' } });
    }

    // Edges
    newEdges.push({ id: 'e1', source: 'user', target: 'client', label: 'Click/Nav', markerEnd: { type: MarkerType.ArrowClosed } });
    newEdges.push({ id: 'e2', source: 'client', target: 'api', label: 'Fetch', markerEnd: { type: MarkerType.ArrowClosed }, animated: true });

    return getLayoutedElements(newNodes, newEdges, 'TB');
  }, [entryPoints, importantFiles]);


  const generateClassGraph = useCallback(() => {
    const newNodes = [];
    const newEdges = [];

    // Group by folder to create a hierarchy diagram
    const fileNodes = importantFiles.slice(0, 12).map((f, i) => {
      return {
        id: `file-${i}`,
        data: {
          label: (
            <div className="text-xs">
              <div className="font-bold border-b pb-1 mb-1">{f.path.split('/').pop()}</div>
              <div className="text-[10px] text-gray-500">{f.type}</div>
            </div>
          )
        },
        position: { x: 0, y: 0 },
        style: { background: '#fff', border: '1px solid #333', width: 140, textAlign: 'left', padding: '5px', borderRadius: '0px' },
        parentId: 'root'
      };
    });

    newNodes.push(...fileNodes);

    // Link files in same folder
    for (let i = 0; i < fileNodes.length - 1; i++) {
      const pathA = importantFiles[i].path.split('/').slice(0, -1).join('/');
      const pathB = importantFiles[i + 1].path.split('/').slice(0, -1).join('/');
      if (pathA === pathB) {
        newEdges.push({
          id: `e-${i}-${i + 1}`,
          source: fileNodes[i].id,
          target: fileNodes[i + 1].id,
          type: 'step',
          style: { stroke: '#aaa' }
        });
      }
    }

    return getLayoutedElements(newNodes, newEdges, 'TB');
  }, [importantFiles]);


  useEffect(() => {
    let layout;
    switch (activeDiagram) {
      case 'usecase':
        layout = generateUseCaseGraph();
        break;
      case 'sequence':
        layout = generateSequenceGraph();
        break;
      case 'class':
        layout = generateClassGraph();
        break;
      default:
        layout = generateUseCaseGraph();
    }
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [activeDiagram, generateUseCaseGraph, generateSequenceGraph, generateClassGraph, setNodes, setEdges]);

  return (
    <ReactFlowProvider>
      <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col relative overflow-hidden" style={{ height: '100%', minHeight: '500px' }}>
        <div className="flex border-b border-gray-200 bg-gray-50 z-10">
          <button
            onClick={() => setActiveDiagram('usecase')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${activeDiagram === 'usecase' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <User size={14} /> Use Case
          </button>
          <button
            onClick={() => setActiveDiagram('sequence')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${activeDiagram === 'sequence' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ArrowRight size={14} /> Flow
          </button>
          <button
            onClick={() => setActiveDiagram('class')}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${activeDiagram === 'class' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Code size={14} /> Class
          </button>
        </div>

        <div className="flex-1 w-full h-full bg-gray-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-right"
          >
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
