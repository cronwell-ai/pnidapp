'use client'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export const useNode = (nid: string) => useQuery({
  queryKey: ['node', `${nid}`],
  queryFn: async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('nodes')
      .select('*')
      .eq('id', nid)
      .single();
    if (error) throw error
    return data
  }
});

export async function getAutoParse(nodeId: string, docId: string) {
  const supabase = createClient();
  const { data: nodeData, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('id', nodeId)
    .single();
  if (error) throw error
  const { pos_x, pos_y, width, height, equipment_type } = nodeData;
  const response = await fetch('/api/autoparse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_id: docId,
      pos_x,
      pos_y,
      width,
      height,
      equipment_type,
    }),
  });

  if (!response.ok) {
    throw new Error('Invalid Network Response');
  }

  const { image, desc } = await response.json();
  return { image, desc };
}

export const useNodeAutoParse = (nodeId: string, docId: string) => {
  return useQuery({
    queryKey: ['auto-parse', `${nodeId}`],
    queryFn: () => getAutoParse(nodeId, docId)
  })
}

export interface PNIDElementType {
  id: string,
  created_at: Date,
  short_uid: string,
  name: string | null,
  pos_x: number,
  pos_y: number,
  width: number,
  height: number,
  pnid: string,
  equipment_type: "Equipments" | "Instruments" | "Valves" | "Pipes",
  metadata: any,
  color: string,
  shape: string,
  verified: boolean
}

export const useNodeList = (docId: string) => {
  return useQuery({
    queryKey: ['nodes', docId],
    queryFn: async () => {
      const supabase = createClient()
      const { data: docData, error: docError } = await supabase.from('files').select('id').eq('short_uid', docId).single()
      if (docError) { throw docError }
      const { data, error } = await supabase
        .from('nodes')
        .select('*')
        .eq('pnid', docData.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      try {
        return data as PNIDElementType[]
      } catch (e) {
        throw e
      }
    }
  })
}

