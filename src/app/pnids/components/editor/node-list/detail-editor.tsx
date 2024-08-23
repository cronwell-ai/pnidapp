'use client'

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { CirclePlus, X } from 'lucide-react';
import { useNode, useNodeAutoParse } from '@/lib/reactquery/useNode';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import sentryHelper from '@/lib/sentry';

export interface NodeDetailsType {
  id: string;
  name: string;
  type: string;
  description?: string;
}

const metadataItemSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

const nodeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  metadataItems: z.array(metadataItemSchema),
});

type NodeFormData = z.infer<typeof nodeSchema>;

export function DetailEditor({ activeNode, setDetail, docId }: {
  activeNode: NodeDetailsType | null,
  setDetail: (value: NodeDetailsType | null) => void
  docId: string
}) {
  const queryClient = useQueryClient();
  const { data: nodeData, error: nodeError, isLoading: isLoadingNode, status: nodeLoadingStatus } = useNode(activeNode?.id || '');
  const { data: autoParseData, error: autoParseError, isLoading: isLoadingAutoParse, status: autoParseStatus } = useNodeAutoParse(activeNode?.id || '', docId);
  const [enableAutoParse, setEnableAutoParse] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NodeFormData>({
    resolver: zodResolver(nodeSchema),
    defaultValues: {
      name: '',
      description: '',
      metadataItems: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "metadataItems",
  });

  function updateForm() {
    const metadataItems = nodeData.metadata ? Object.entries(nodeData.metadata)
      .filter(([key]) => key !== 'description')
      .map(([key, value]) => ({ key, value: String(value) })) : [];

    reset({
      name: nodeData.name || '',
      description: nodeData.metadata ? nodeData.metadata.description || '' : '',
      metadataItems,
    });
  }

  useEffect(() => {
    if (nodeData) {
      updateForm();
    }
  }, [nodeLoadingStatus]);

  useEffect(() => {
    if (enableAutoParse && autoParseData) {
      const { image, desc } = autoParseData;
      reset({
        name: desc.name || '',
        description: desc.description || '',
        metadataItems: Object.entries(desc)
          .filter(([key]) => ((key !== 'description') && (key !== 'name')))
          .map(([key, value]) => ({ key, value: String(value) }))
      });
      setEnableAutoParse(false);
      if (activeNode) {
      queryClient.invalidateQueries({ queryKey: ['auto-parse', `${activeNode.id}`]});
      }
    }
  }, [autoParseStatus, enableAutoParse]);

  if (!activeNode) return <></>;
  if (nodeError) return <div>Error: {nodeError.message}</div>;

  const onSubmit = async (data: NodeFormData) => {
    const supabase = createClient();
    if (activeNode && activeNode.id) {
      const metadata = {
        description: data.description,
        ...Object.fromEntries(data.metadataItems.map(item => [item.key, item.value]))
      };

      const { data: node, error } = await supabase
        .from('nodes')
        .update({
          name: data.name,
          metadata,
        })
        .eq('id', activeNode.id)
        .select("id, pnid")
        .single();
      if (error) {
        sentryHelper.logError(error);
      } else if (node) {
        queryClient.refetchQueries({ queryKey: ['node', `${node.id}`] });
        await supabase.from('files').select('short_uid').eq('id', node.pnid).single().then(({ data, error }) => {
          if (!error && data.short_uid) {
            queryClient.refetchQueries({ queryKey: ['nodes', `${data.short_uid}`] });
          }
        });
        reset();
        setDetail(null);
      }
    }
  };

  return (
    <div className='overflow-y-scroll p-4 overflow-x-hidden'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-primary">Name</label>
          <Input
            {...register('name')}
            type="text"
            placeholder={nodeData?.name ? nodeData.name : ''}
            id="name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-primary">Description</label>
          <Textarea
            {...register('description')}
            id="description"
            placeholder={nodeData?.metadata?.description ? nodeData.metadata.description : ''}
            rows={4}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        <div className="mb-4 space-y-3">
          <div className='flex items-center justify-between'>
            <label className="block text-sm font-medium text-primary">Additional Metadata</label>
            <Button
              type="button"
              variant={'outline'}
              onClick={() => append({ key: '', value: '' })}
              className="p-1 w-min h-min px-4"
            >
              <CirclePlus className="w-4 h-4 mr-2" />
              New Row
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className='flex flex-row items-center justify-between'>
            <div className="grid grid-cols-12 grow gap-x-1.5">
              <Input
                {...register(`metadataItems.${index}.key`)}
                placeholder="Key"
                className="col-span-5"
              />
              <Input
                {...register(`metadataItems.${index}.value`)}
                placeholder="Value"
                className="col-span-7"
              />
            </div>
            <Button variant={'ghost'} onClick={() => remove(index)} className="p-0 w-min h-min shrink ml-1">
              <X className="w-4 h-4" />
            </Button>
            </div>
          ))}
        </div>
        <div className='flex flex-row items-center gap-4 w-full mt-8'>
          <Button className="p-2 px-4 h-min w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
          <Button variant={'outline'} className="p-2 h-min w-full px-4" type="button" onClick={async () => {
            setEnableAutoParse(true);
          }}>Auto Parse</Button>
        </div>
      </form>
    </div>
  )
}