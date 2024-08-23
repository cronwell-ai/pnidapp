import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Node,
  useKeyPress,
  useReactFlow,
  getConnectedEdges,
  KeyCode,
  Edge,
  XYPosition,
  useStore,
} from 'reactflow';
import { createClient } from '@/lib/supabase/client';
import type { QueryClient } from '@tanstack/react-query';
import { useEditorStore } from '../store';
import { genShortId } from '@/lib/utils';

function useShortcut(keyCode: KeyCode, callback: Function): void {
  const [didRun, setDidRun] = useState(false);
  const shouldRun = useKeyPress(keyCode);

  useEffect(() => {
    if (shouldRun && !didRun) {
      callback();
      setDidRun(true);
    } else {
      setDidRun(shouldRun);
    }
  }, [shouldRun, didRun, callback]);
}

export default function useCopyPaste<NodeData, EdgeData>(docId: string, queryClient: QueryClient) {
  const mousePosRef = useRef<XYPosition>({ x: 0, y: 0 });
  const rfDomNode = useStore((state) => state.domNode);
  const { filter } = useEditorStore();

  const { getNodes, setNodes, getEdges, setEdges, screenToFlowPosition } =
    useReactFlow<NodeData, EdgeData>();

  // Set up the paste buffers to store the copied nodes and edges.
  const [bufferedNodes, setBufferedNodes] = useState([] as Node<NodeData>[]);
  const [bufferedEdges, setBufferedEdges] = useState([] as Edge<EdgeData>[]);

  // initialize the copy/paste hook
  // 1. remove native copy/paste/cut handlers
  // 2. add mouse move handler to keep track of the current mouse position
  useEffect(() => {
    const events = ['cut', 'copy', 'paste'];

    if (rfDomNode) {
      const preventDefault = (e: Event) => e.preventDefault();

      const onMouseMove = (event: MouseEvent) => {
        mousePosRef.current = {
          x: event.clientX,
          y: event.clientY,
        };
      };

      for (const event of events) {
        rfDomNode.addEventListener(event, preventDefault);
      }

      rfDomNode.addEventListener('mousemove', onMouseMove);

      return () => {
        for (const event of events) {
          rfDomNode.removeEventListener(event, preventDefault);
        }

        rfDomNode.removeEventListener('mousemove', onMouseMove);
      };
    }
  }, [rfDomNode]);

  async function addNodeToDB(start_pos: XYPosition, width: number, height: number, shape: string, color: string) {
    const db = createClient()
    const short_uid = genShortId()
    const pos_x = start_pos.x
    const pos_y = start_pos.y
    const res = await db.from('files').select('id').eq('short_uid', docId).single().then(async ({data, error, status}) => {
      if (error || !data) {
        return { status, data, error }
      }
      const pnid = data.id
      const verified = false
      const equipment_type = filter
      const res = await db.from('nodes').insert([{ short_uid, pos_x, pos_y, width, height, pnid, verified, shape, color, equipment_type }]).select()
      if (res.status === 201) {
        queryClient.invalidateQueries({ queryKey: ['nodes', docId] })
      }
      return res
    })
    return res
  }

  const copy = useCallback(() => {
    const selectedNodes = getNodes().filter((node) => node.selected);
    const selectedEdges = getConnectedEdges(selectedNodes, getEdges()).filter(
      (edge) => {
        const isExternalSource = selectedNodes.every(
          (n) => n.id !== edge.source
        );
        const isExternalTarget = selectedNodes.every(
          (n) => n.id !== edge.target
        );

        return !(isExternalSource || isExternalTarget);
      }
    );

    setBufferedNodes(selectedNodes);
    setBufferedEdges(selectedEdges);
  }, [getNodes, getEdges]);

  const cut = useCallback(() => {
    const selectedNodes = getNodes().filter((node) => node.selected);
    const selectedEdges = getConnectedEdges(selectedNodes, getEdges()).filter(
      (edge) => {
        const isExternalSource = selectedNodes.every(
          (n) => n.id !== edge.source
        );
        const isExternalTarget = selectedNodes.every(
          (n) => n.id !== edge.target
        );

        return !(isExternalSource || isExternalTarget);
      }
    );

    setBufferedNodes(selectedNodes);
    setBufferedEdges(selectedEdges);

    // A cut action needs to remove the copied nodes and edges from the graph.
    setNodes((nodes) => nodes.filter((node) => !node.selected));
    setEdges((edges) => edges.filter((edge) => !selectedEdges.includes(edge)));
  }, [getNodes, setNodes, getEdges, setEdges]);

  const paste = useCallback(
    (
      { x: pasteX, y: pasteY } = screenToFlowPosition({
        x: mousePosRef.current.x,
        y: mousePosRef.current.y,
      })
    ) => {
      const minX = Math.min(...bufferedNodes.map((s) => s.position.x));
      const minY = Math.min(...bufferedNodes.map((s) => s.position.y));

      const now = Date.now();

      const newNodes: Node<NodeData>[] = bufferedNodes.map((node) => {
        const id = `${now} (${node.id} copy)`;
        const x = pasteX + (node.position.x - minX);
        const y = pasteY + (node.position.y - minY);

        return { ...node, id, position: { x, y } };
      });

      newNodes.forEach((node: any, idx: number) => {
        const shape = node.data.type
        const color = node.data.color
        const width = node.style.width
        const height = node.style.height
        const start_pos = { x: node.position.x, y: node.position.y }
        addNodeToDB(start_pos, width, height, shape, color).then((res) => {
          if (res.status === 201) {
            if (res.data) {
              const new_id = res.data[0].id
              newNodes[idx].id = new_id
              setNodes((nodes) => [
                ...nodes.map((node) => ({ ...node, selected: false })),
                newNodes[idx],
              ]);
            }
          }
        })
      })

      /* TODO: update for edge */
      const newEdges: Edge<EdgeData>[] = bufferedEdges.map((edge) => {
        const id = `${edge.id}-${now}`;
        const source = `${edge.source}-${now}`;
        const target = `${edge.target}-${now}`;

        return { ...edge, id, source, target };
      });

      setEdges((edges) => [
        ...edges.map((edge) => ({ ...edge, selected: false })),
        ...newEdges,
      ]);
    },
    [bufferedNodes, bufferedEdges, screenToFlowPosition, setNodes, setEdges]
  );

  useShortcut(['Meta+x', 'Control+x'], cut);
  useShortcut(['Meta+c', 'Control+c'], copy);
  useShortcut(['Meta+v', 'Control+v'], paste);

  return { cut, copy, paste, bufferedNodes, bufferedEdges };
}