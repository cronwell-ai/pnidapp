'use client'
import { useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionMode,
  DefaultEdgeOptions,
  MarkerType,
  useNodesState,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useViewerStore } from '../store';
import Sidebar from './info-card';
import { getNodesForFlow } from '@/actions/db/nodes';
import { useMeasure } from '@uidotdev/usehooks';

import ShapeNode from './nodes/shapenode';
import PIDNode from './nodes/pidnode';
import sentryHelper from '@/lib/sentry';

const nodeTypes = {
  shape: ShapeNode,
  pnid: PIDNode,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 2 },
};

export default function ViewerFlow({ docId }: { docId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [ref, { width, height }] = useMeasure();
  const { setSelectedNode } = useViewerStore();

  const { fitView } = useReactFlow();

  const handleResize = useCallback(() => {
    fitView({ padding: 0.1, duration: 200 });
  }, [fitView]);

  useEffect(() => {
    handleResize();
  }, [width, height, handleResize]);

  useEffect(() => {
    async function getNodes() {
      const res = await getNodesForFlow(docId, 'viewer')
      if (res.success && res.data) {
        setNodes(res.data)
      } else {
        sentryHelper.logMessage(res.error, true)
      }
    }
    getNodes()
  }, [docId])

  return (
    <div className="w-full h-full bg-white" ref={ref}>
      <ReactFlow
        nodes={nodes}
        minZoom={0.3}
        maxZoom={8}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        onNodeClick={(event, node) => {
          if (node && node.type !== 'pnid') {
            setSelectedNode(node)
          } else if (node?.type === 'pnid') {
            setSelectedNode(null)
          }
        }}
        onNodeDrag={(event, node) => {
          if (node && node.type !== 'pnid') {
            setSelectedNode(node)
          } else if (node?.type === 'pnid') {
            setSelectedNode(null)
          }
        }}
        fitView
      >
        <Background variant={BackgroundVariant.Cross} className='bg-muted' />
        <Panel position='bottom-right'>
          <Sidebar />
        </Panel>
      </ReactFlow>
    </div>
  );
};