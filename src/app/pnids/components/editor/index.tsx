'use client'
import XYFlow from './xyflow';
import NodeList from './node-list';
import { ReactFlowProvider } from 'reactflow';
import ViewerFlow from './xyflow/viewer';

export function Viewer({ docId }: { docId: string }) {
  return (
    <>
      <ReactFlowProvider>
        <div className='w-full h-full p-2 flex items-center justify-between gap-1.5 max-h-full overflow-auto'>
          <div className='h-full w-full w-min[70%] bg-white dark:bg-black shrink-0 rounded-md border'>
            <ViewerFlow docId={docId} />
          </div>
        </div>
      </ReactFlowProvider>
    </>
  )
}

export default function Editor({ docId }: { docId: string }) {
  return (
    <>
      <ReactFlowProvider>
        <div className='w-full h-full p-2 flex items-center justify-between gap-1.5 max-h-full overflow-auto'>
          <div className='h-full w-[75%] w-min[70%] bg-white dark:bg-black shrink-0 rounded-md border'>
            <XYFlow docId={docId} />
          </div>
          <NodeList docId={docId} />
        </div>
      </ReactFlowProvider>
    </>
  )
}