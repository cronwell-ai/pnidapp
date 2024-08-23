'use server'
import { createClient } from "@/lib/supabase/server";
import { type Node } from 'reactflow';

const getPnode = async (docId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.from('files').select('*').eq('short_uid', docId).single()
  if (error) {
    return {
      success: false,
      error: error.message,
      data: null
    }
  } else {
    return {
      success: true,
      error: null,
      data: {
        id: "0",
        position: { x: 0, y: 0 },
        draggable: false,
        selectable: false,
        type: "pnid",
        data: {
            height: data.height ?? 1600,
            width: data.width ?? 2500,
            docId: docId,
        }
      } as Node
    }
  }
}


export async function getNodesForFlow(docId: string, mode: 'editor' | 'viewer' = 'editor') {
  const supabase = createClient()
  const { data: docData, error: docError } = await supabase.from('files').select('id').eq('short_uid', docId).single()
  if (docError) {
    return {
      success: false,
      error: docError.message,
      data: []
    }
  }
  const { data, error } = await supabase.from('nodes')
        .select('*')
        .eq('pnid', docData.id)
        .order('created_at', { ascending: false })
  const pnode = await getPnode(docId)
  if (error) {
    return {
      success: false,
      error: error.message,
      data: []
    }
  } else if (!pnode.data) {
    return {
      success: false,
      error: 'PNID not found',
      data: []
    }
  } else {
    return {
      success: true,
      error: null,
      data: [pnode.data].concat(data.map((node: any) => {
        return {
          id: node.id,
          type: 'shape',
          position: { x: node.pos_x, y: node.pos_y },
          style: { width: node.width, height: node.height },
          data: {
            type: node.shape,
            color: node.color,
            mode: mode,
          },
          width: node.width,
          height: node.height,
          equipment_type: node.equipment_type,
          selected: false,
        } as Node
      }))
    }
  }
}

export async function getNodesForExport(docId: string) {
  const supabase = createClient()
  const { data: docData, error: docError } = await supabase.from('files').select('id').eq('short_uid', docId).single()
  if (docError) {
    return {
      success: false,
      error: docError.message,
      data: []
    }
  }
  const { data, error } = await supabase.from('nodes')
        .select('*')
        .eq('pnid', docData.id)
        .order('created_at', { ascending: false })
  if (error) {
    return {
      success: false,
      error: error.message,
      data: []
    }
  } else {
    try {
      const output = data.map((node: any) => {
        return {
          id: node.id,
          shape: node.shape,
          color: node.color,
          start_x_pos: node.pos_x,
          start_y_pos: node.pos_y,
          width: node.width,
          height: node.height,
          title: node.name ? `${node.equipment_type} ${node.name}` : `Unnamed ${node.equipment_type}`,
          metadata: node.metadata,
        }
      })
      return {
        success: true,
        error: null,
        data: output
      }
    } catch (err) {
      return {
        success: false,
        error: "Parsing Error",
        data: []
      }
    }
  }
}

export async function updateNode(nodeId: string, pos_x: number, pos_y: number, width: number, height: number) {
  const supabase = createClient()
  const { error } = await supabase.from('nodes')
        .update({ pos_x, pos_y, width, height })
        .eq('id', nodeId)
  if (error) {
    return {
      success: false,
      error: error.message,
    }
  } else {
    return {
      success: true,
      error: null,
    }
  }
}

export async function deleteNode(nodeId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('nodes')
        .delete()
        .eq('id', nodeId)
  if (error) {
    return {
      success: false,
      error: error.message,
    }
  } else {
    return {
      success: true,
      error: null,
    }
  }
}