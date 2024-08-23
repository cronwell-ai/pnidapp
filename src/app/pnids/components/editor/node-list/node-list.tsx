'use client'
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, RefObject } from "react";
import { useEditorStore } from '../store';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type XYPosition, getNodesBounds, useReactFlow } from 'reactflow';
import { Pencil } from "lucide-react";
import { useNodeList } from '@/lib/reactquery/useNode';

function EditableButton({ node, isHighlighted, onFocus, onEdit, setDetail }: {
  node: any,
  isHighlighted: boolean,
  onFocus: () => void,
  onEdit: (id: string, newName: string) => void
  setDetail: (value: {id: string, name: string, type: string} | null) => void
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editedName !== node.name) {
      onEdit(node.id, editedName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editedName}
        onChange={(e) => setEditedName(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-12 p-2 w-full text-center deselect_protected"
      />
    );
  }

  return (
    <div tabIndex={0}
      className={cn(buttonVariants({ variant: "outline" }),
        "text-primary h-12 p-2 border w-full rounded-md deselect_protected flex items-center justify-between",
        isHighlighted ? 'ring ring-offset-2 ring-ring' : '')}
      onFocus={onFocus}
      onDoubleClick={handleDoubleClick}
    >
      <h2 className="truncate">{node.name ? node.name : "(no name)"}</h2>
      <Button variant="ghost" className="p-0 h-min w-min text-muted-foreground" tabIndex={-1} onClick={() => {
        setDetail({ id: node.id, name: node.name, type: node.equipment_type });
      }}>
        <Pencil className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function NodeList({ docId, containerRef, setDetail, isHidden }: {
  docId: string,
  containerRef: RefObject<HTMLDivElement>,
  setDetail: (value: {id: string, name: string, type: string} | null) => void,
  isHidden: boolean
}) {
  const { data: nodes } = useNodeList(docId)
  const { filter, defaultViewport, setFocusViewport, setFocusBound } = useEditorStore();
  const [prevNodes, setPrevNodes] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const queryClient = useQueryClient();
  const reactFlow = useReactFlow();
  const prevIsHiddenRef = useRef(isHidden);

  useEffect(() => {
    if (nodes) {
      setPrevNodes(nodes);
    }
  }, [nodes]);

  function deselectNode() {
    setSelectedIdx(-1);
    setFocusBound(null)
    reactFlow.setNodes((nodes) =>
      nodes.map((n) => {
        return {
          ...n,
          selected: false,
        }
      }))
    if (defaultViewport) {
      setFocusViewport(defaultViewport)
    }
  }

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (isHidden) return;
      const elements = ['button', 'div', 'input'];
      const shouldIgnore = elements.some(tag => {
        const element = (event.target as HTMLElement).closest(tag);
        return element?.classList.contains('deselect_protected');
      });
      if (containerRef.current?.contains(event.target as Node) && !shouldIgnore) {
        deselectNode();
      }
    }

    // Attach the listener to the document
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [defaultViewport, isHidden]);

  useEffect(() => {
    if (prevIsHiddenRef.current === true && isHidden === false) {
      deselectNode()
    }
    prevIsHiddenRef.current = isHidden;
  }, [isHidden]);


  function highlightNode(pos: XYPosition, width: number, height: number, id: string): void {
    const node = {
      id, width, height, position: pos, data: {}
    }
    reactFlow.setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            selected: true,
          }
        } else {
          return {
            ...n,
            selected: false,
          }
        }
      }))
    const bound = getNodesBounds([node])
    setFocusBound(bound)
  }

  const updateNodeMutation = useMutation({
    mutationFn: async ({ id, newName }: { id: string, newName: string }) => {
      const { data, error } = await createClient()
        .from('nodes')
        .update({ name: newName })
        .eq('id', id).select('id').single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variable, context) => {
      queryClient.invalidateQueries({ queryKey: ['nodes', `${docId}`] });
      queryClient.invalidateQueries({ queryKey: ['node', `${variable.id}`] });
    },
  });

  const handleEdit = (id: string, newName: string) => {
    updateNodeMutation.mutate({ id, newName });
  };

  return (
    <div className={cn('overflow-y-scroll p-4 overflow-x-hidden', isHidden ? "hidden" : "")}>
      <ul role="listbox" className="grid grid-cols-2 gap-3">
        <AnimatePresence initial={false}>
          {nodes?.filter((node) => {
            if (filter === 'All') return true;
            return node.equipment_type == filter
          }).map((node: any, index: number) => {
            const isNew = !prevNodes.find((prevNode: any) => prevNode.id === node.id);
            const highlighted = index === selectedIdx;
            return (
              <motion.div
                key={node.id}
                initial={isNew ? { x: 300, opacity: 0 } : { opacity: 1 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <li role="option">
                  <EditableButton
                    node={node}
                    isHighlighted={highlighted}
                    onFocus={() => {
                      setSelectedIdx(index);
                      highlightNode({ x: node.pos_x, y: node.pos_y }, node.width, node.height, node.id);
                    }}
                    onEdit={handleEdit}
                    setDetail={setDetail}
                  />
                </li>
              </motion.div>

            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}