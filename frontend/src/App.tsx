import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useState } from 'react';
import { ImportPanel } from './ImportPanel';
import CodeNode from './CodeNode';

const nodeTypes = {
  code: CodeNode,
}

const initialNodes = [
  { id: '1', type: 'code', position: { x: 0, y: 0 }, data: { label: 'name = \'World\'' } },
  { id: '2', type: 'code', position: { x: 0, y: 50 }, data: { label: 'print(f\'Hello, {name}!\')' } },
];
const initialEdges = [{ id: '1-2', source: '1', target: '2' }];

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>







<div
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `
      radial-gradient(circle at 20% 30%, rgba(120,140,150,0.05) 0%, transparent 60%),
      radial-gradient(circle at 70% 60%, rgba(135,155,165,0.03) 0%, transparent 50%),
      linear-gradient(180deg, rgba(20,25,35,1), rgba(10,15,25,1))
    `,
    backgroundSize: '250% 250%',
    animation: 'moveBackground 120s linear infinite',
    zIndex: 0,
  }}
/>

<style>
{`
@keyframes moveBackground {
  0% { background-position: 0% 0%; }
  50% { background-position: 20% 20%; }
  100% { background-position: 0% 0%; }
}
`}
</style>









      {/* React Flow canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        panOnScroll
        proOptions={{ hideAttribution: true }}
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        <ImportPanel />
        {/*<MiniMap />*/}
        <Controls />
      </ReactFlow>
    </div>
  );
}
