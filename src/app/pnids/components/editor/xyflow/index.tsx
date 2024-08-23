'use client'
import { MouseEvent, useEffect } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionMode,
  DefaultEdgeOptions,
  MarkerType,
  useNodesState,
  useReactFlow,
  XYPosition,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEditorStore } from '../store';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { getNodesForFlow } from '@/actions/db/nodes';
import { updateNode, deleteNode } from '@/actions/db/nodes';
import { useMeasure } from '@uidotdev/usehooks';

import ShapeNode from './nodes/shapenode';
import PIDNode from './nodes/pidnode';
import useCopyPaste from './useCopyPaste';
import { genShortId } from '@/lib/utils';
import { getAutoParse } from '@/lib/reactquery/useNode';
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

export default function CustomNodeFlow({ docId }: { docId: string }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const { screenToFlowPosition, fitBounds, fitView} = useReactFlow();
  const { drawingMode, isDrawing, setIsDrawing, drawStart, setDrawStart, setDrawEnd, drawId, setDrawId, filter, getColor, focusBound  } = useEditorStore();
  const [ref, { width, height }] = useMeasure();
  const queryClient = useQueryClient()
  useCopyPaste(docId, queryClient);

  useEffect(() => {
    async function getNodes() {
      const res = await getNodesForFlow(docId)
      if (res.success && res.data) {
        const filtered = res.data.filter((node: any) => {
          if (filter !== "All" && node.type === 'shape') {
            return node.equipment_type === filter
          }
          return true
        })
        setNodes(filtered)
      } else {
        sentryHelper.logMessage(res.error, true)
      }
    }
    getNodes()
  }, [filter])

  useEffect(() => {
    if (focusBound) {
      fitBounds(focusBound, { duration: 500 });
    } else {
      fitView({ padding: 0.1, duration: 200 });
    }
  }, [width, height, focusBound]);

  function shapeHelper(pos_a: XYPosition, pos_b: XYPosition) {
    const start_x = Math.min(pos_a.x, pos_b.x)
    const start_y = Math.min(pos_a.y, pos_b.y)
    const width = Math.abs(pos_a.x - pos_b.x)
    const height = Math.abs(pos_a.y - pos_b.y)
    const start_pos = { x: start_x, y: start_y } as XYPosition
    return { start_pos, width, height }
  }

  const drawOnMouseDown = (evt: MouseEvent) => {
    if (drawingMode) {
      if (evt.target instanceof HTMLElement) {
        const target = evt.target as HTMLElement
        if (target.className.includes('react-flow')) {
          setIsDrawing(true)
          const position = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
          setDrawStart(position)
          setDrawEnd(position)
          const drawId = genShortId()
          const newNode = {
            id: drawId,
            type: 'shape',
            position: position,
            style: { width: 0, height: 0 },
            data: {
              type: drawingMode,
              color: getColor(filter),
            },
            selected: false,
          };
          setNodes((nodes) =>
            nodes.map((n) => ({ ...n, selected: false })).concat([newNode])
          );
          setDrawId(drawId)
        }
      }
    }
  }

  const drawOnMouseMove = (evt: MouseEvent) => {
    if (drawingMode && isDrawing && evt.buttons === 1) {
      const position = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
      setDrawEnd(position)
      const pos_a = drawStart
      if (drawId && pos_a) {
        const { start_pos, width, height } = shapeHelper(pos_a, position)
        setNodes((nodes) =>
          nodes.map((n) => {
            if (n.id === drawId) {
              return {
                ...n,
                position: start_pos,
                style: { width: width, height: height },
                selected: false,
              }
            }
            return n
          })
        );
      }
    }
  }

  async function addNodeToDB(start_pos: XYPosition, width: number, height: number, shape: string, color: string, short_uid: string) {
    const db = createClient()
    const pos_x = start_pos.x
    const pos_y = start_pos.y
    const res = await db.from('files').select('id').eq('short_uid', docId).single().then(async ({ data, error }) => {
      if (error || !data) {
        sentryHelper.logError(error)
        return [null, null]
      }
      const pnid = data.id
      const verified = false
      const equipment_type = filter
      const res = await db.from('nodes').insert([{ short_uid, pos_x, pos_y, width, height, pnid, verified, shape, color, equipment_type }]).select('*').single()
      if (res.status === 201 && res.data) {
        queryClient.invalidateQueries({ queryKey: ['nodes', docId] })
        return [res.data.id, short_uid]
      } else {
        sentryHelper.logError(res.error)
        return [null, null]
      }
    })
    return res
  }

  const shouldAllowDraw = (evt: MouseEvent) => {
    const target = evt.target
    if (target instanceof HTMLElement) {
      if (target.className.includes('react-flow')) {
        return true
      }
      if (target.className.includes('cursor-crosshair')) {
        return true
      }
    } else if (target instanceof SVGElement) {
      if (target instanceof SVGRectElement || target instanceof SVGCircleElement) {
        return true
      }
      if (target.className.baseVal == 'shape-svg') {
        return true
      }
    }
    return false
  }

  const drawOnMouseUp = (evt: MouseEvent) => {
    if (drawingMode) {
      if (shouldAllowDraw(evt)) {
        const pos_a = drawStart
        const pos_b = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
        if (drawId && pos_a) {
          const { start_pos, width, height } = shapeHelper(pos_a, pos_b)
          if (width < 2 || height < 2) {
            setNodes((nodes) => nodes.filter((n) => n.id !== drawId))
          } else {
            const node = nodes.filter((n) => n.id === drawId)[0]
            if (node) {
              const shape = node.data.type
              const color = node.data.color
              addNodeToDB(start_pos, width, height, shape, color, node.id).then(([id, nid]) => {
                if (id && nid) {
                  queryClient.prefetchQuery({
                    queryKey: ['auto-parse', nid],
                    queryFn: () => getAutoParse(nid, docId)
                  })
                  setNodes((nodes) =>
                    nodes.map((n) => {
                      if (n.id === nid) {
                        return {
                          ...n,
                          data: {
                            ...n.data,
                            mode: 'editor'
                          },
                          id: id,
                          position: start_pos,
                          style: { width: width, height: height },
                          selected: true,
                        }
                      }
                      return n
                    })
                  );
                }
              })
            }
          }
        }
        setIsDrawing(false)
      }
    }
  }

  return (
    <div className="w-full h-full bg-white" ref={ref}>
      <ReactFlow
        nodes={nodes}
        minZoom={0.3}
        maxZoom={8}
        onNodesChange={onNodesChange}
        onMouseDown={drawOnMouseDown}
        onMouseUp={drawOnMouseUp}
        onMouseMove={drawOnMouseMove}
        onNodeDragStop={(evt, node) => {
          async function local_update() {
            const { x, y } = node.position
            const { id, width, height } = node
            const res = await updateNode(id, x, y, width!, height!)
          }
          local_update()
        }}
        onNodesDelete={(nodes) => {
          async function local_delete(nodeId: string) {
            const res = await deleteNode(nodeId)
            queryClient.invalidateQueries({ queryKey: ['nodes', docId] })
          }
          for (const node of nodes) {
            local_delete(node.id)
          }
        }}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeTypes={nodeTypes}
        panOnDrag={drawingMode === null}
        connectionMode={ConnectionMode.Loose}
        fitView
        className={drawingMode ? 'cursor-crosshair' : ''}
      >
        <Background variant={BackgroundVariant.Cross} className='bg-muted' style={{ cursor: drawingMode ? 'crosshair' : 'default' }} />
      </ReactFlow>
    </div>
  );
};