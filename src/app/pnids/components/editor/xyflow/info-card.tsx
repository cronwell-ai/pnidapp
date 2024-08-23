import React, { useState, useEffect } from 'react';
import { useViewerStore } from '../store';
import { useNode } from '@/lib/reactquery/useNode';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CircleGauge, CircleHelp, Factory, Unplug, Workflow } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function NodeDetail({ id }: { id: string }) {
  const { data, error, isLoading } = useNode(id);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (data) {
      setDescription(data.metadata?.description || 'No description available');
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading node data</div>;
  }

  function isMetadataEmpty(metadata: any) {
    if (!metadata) return true;
    return Object.keys(metadata).filter(key => key !== 'description').length === 0;
  }

  return (
    <div className="space-y-4">
      <Badge variant="secondary">{data?.equipment_type}</Badge>
      <p className="text-sm text-muted-foreground">{description}</p>
      {!isMetadataEmpty(data?.metadata) && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Metadata:</h4>
          <ScrollArea className="h-[100px] w-full rounded-md border p-2">
            <dl className="text-sm">
              {Object.entries(data.metadata).map(([key, value]) => {
                if (key === 'description') return null;
                return (
                  <div key={key} className="grid grid-cols-5 gap-1 mb-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <dt className="font-medium text-muted-foreground col-span-2 truncate">
                            {key}:
                          </dt>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{key}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <dd className="col-span-3">{String(value)}</dd>
                  </div>)
              })}
            </dl>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

function InfoCard() {
  const { selectedNode } = useViewerStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!!selectedNode);
  }, [selectedNode]);

  const { data } = useNode(selectedNode?.id || '');
  const nodeName = data?.name || `Unnamed ${data?.equipment_type || 'Node'}`;

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'Equipments':
        return <Factory className="w-5 h-5 mr-2" />;
      case 'Instruments':
        return <CircleGauge className="w-5 h-5 mr-2" />;
      case 'Valves':
        return <Unplug className="w-5 h-5 mr-2" />;
      case 'Pipes':
        return <Workflow className="w-5 h-5 mr-2" />;
      default:
        return <CircleHelp className="w-5 h-5 mr-2" />;
    }
  }

  return (
    <Card
      className={cn(
        'fixed bottom-16 right-10 w-[360px] shadow-lg transition-all duration-300 ease-in-out',
        isVisible
          ? 'transform translate-y-0 opacity-100'
          : 'transform translate-y-full opacity-0'
      )}
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-lg flex items-center">
          {getEquipmentIcon(data?.equipment_type)}
          {nodeName}
        </CardTitle>
      </CardHeader>
      <CardContent className='px-4'>
        {selectedNode ? (
          <NodeDetail id={selectedNode.id} />
        ) : (
          <p className="text-muted-foreground">No node selected</p>
        )}
      </CardContent>
    </Card>
  );
}

export default InfoCard;