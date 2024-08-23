import { Handle, Position, type NodeProps, useStore, NodeResizer } from 'reactflow';
import Shape from './shape'
import { updateNode } from '@/actions/db/nodes';

type ShapeNodeData = {
    type: 'rectangle' | 'circle';
    color: string;
    mode: 'editor' | 'viewer';
};

function useNodeDimensions(id: string) {
    const node = useStore((state) => state.nodeInternals.get(id));
    return {
      width: node?.width || 0,
      height: node?.height || 0,
    };
  }
   
export default function ShapeNode({ id, data, selected } : NodeProps<ShapeNodeData>){
  const { color, type, mode } = data;
  const { width, height } = useNodeDimensions(id)
  return (
    <>
      <NodeResizer
        color={color}
        isVisible={selected && mode === 'editor'}
        lineStyle={{ strokeWidth: 0.5 }}
        onResizeEnd={(evt, params) => {
          async function local_update() {
            const { x, y, width, height } = params
            const res = await updateNode(id, x, y, width, height)
          }
          local_update()
        }}
      />
      <Shape
          type={type}
          width={width}
          height={height}
          fill={color}
          strokeWidth={0.5}
          stroke={color}
          fillOpacity={selected ? 0.8 : 0.3}
          style={{ cursor: 'pointer' }}
        />
      {/* <Handle
        type="source"
        position={Position.Left}
        id="ls"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="ts"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bs"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="rs"
      /> */}
    </>
  );
};
