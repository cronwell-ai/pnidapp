'use client'
import { Separator } from '@/components/ui/separator';
import AddElementDropdown from './add-element';
import NodeList from './node-list';
import TitleFilter from './title-filter';
import { useEditorStore } from '../store';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { noRing, cn } from '@/lib/utils';
import { NodeDetailsType, DetailEditor } from './detail-editor';

function TitleBar({ filter }: { filter: string }) {
  return (
    <div className='flex items-center justify-between h-min shrink-0 py-2 px-4'>
      <TitleFilter />
      {filter !== "All" && <AddElementDropdown />}
    </div>
  )
}

function DetailTitle({ activeNode, setDetail }: { activeNode: NodeDetailsType, setDetail: (value: NodeDetailsType | null) => void }) {
  return (
    <div className='flex items-center justify-between h-min shrink-0 py-2 px-4'>
      <div className="flex items-center gap-1.5">
        <h2 className='text-md font-medium py-2'>Details for {`${activeNode.type ? activeNode.type.toLowerCase() : ""} ${activeNode.name ? activeNode.name : "(no name)"}`}</h2>
      </div>
      <Button variant="ghost" className={cn('p-1 w-min h-min font-bold mb-[1px]', noRing)} onClick={() => {setDetail(null)}}>
        <X className="w-5 h-5" />
      </Button>
    </div>
  )
}

export default function Element({ docId }: { docId: string }) {
  const listContainerRef = useRef<HTMLDivElement>(null);;
  const { filter } = useEditorStore();
  const [activeNode, setActiveNode] = useState<NodeDetailsType | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (activeNode !== null) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300); // Match this with your transition duration
      return () => clearTimeout(timer);
    }
  }, [activeNode]);

  return (
    <div className='h-full w-[25%] bg-white dark:bg-black rounded-md border p-0 overflow-hidden max-h-full flex flex-col' ref={listContainerRef}>
      {!activeNode && <TitleBar filter={filter} />}
      {activeNode && <DetailTitle setDetail={setActiveNode} activeNode={activeNode} />}
      <Separator />
      <div className="relative flex-grow overflow-y-scroll overflow-x-hidden">
        <div 
          className={`absolute inset-0 w-full h-full transition-transform duration-300 ease-in-out ${
            activeNode ? 'translate-x-[-100%]' : 'translate-x-0'
          }`}
        >
          <NodeList docId={docId} containerRef={listContainerRef} setDetail={setActiveNode} isHidden={activeNode !== null} />
        </div>
        <div 
          className={`absolute inset-0 w-full h-full transition-transform duration-300 ease-in-out ${
            activeNode ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {(activeNode || isAnimating) && <DetailEditor activeNode={activeNode || null} setDetail={setActiveNode} docId={docId}/>}
        </div>
      </div>
    </div>
  )
}