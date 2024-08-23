'use client'
import { createClient } from '@/lib/supabase/client';
import { useQuery } from "@tanstack/react-query"

async function loadFile(docId: string): Promise<{fdata : Blob, ftype : string}> {
  const supabase = createClient()
  const { data, error } = await supabase.from('files')
    .select('*')
    .eq('short_uid', docId)
    .single()
  if (error) {
    throw new Error(`Error fetching file path: ${error.message}`)
  }
  const { data: fdata, error: downloadError } = await supabase
    .storage
    .from('files')
    .download(data.fpath)
  if (downloadError) {
    throw new Error(`Error downloading file: ${downloadError.message}`)
  }
  return {
    fdata: fdata as Blob,
    ftype: data.ftype
  }
}

export function useDocument(docId: string) {
  return useQuery({
    queryKey: ['pdfblob', docId],
    queryFn: () => loadFile(docId),
    staleTime: 1000 * 60 * 10,
  })
}