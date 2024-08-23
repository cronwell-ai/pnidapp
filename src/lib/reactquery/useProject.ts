'use client'
import { useQuery } from '@tanstack/react-query'
import { getProjectThumbnail } from '@/actions/db/projects'
import { createClient } from '@/lib/supabase/client'
import { getProjectByDocId } from '@/actions/db/projects'

export function useProjectThumbnail(id: string) {
  return useQuery({
    queryKey: ['projects-thumbnail', `${id}`],
    queryFn: async () => {
      const thumbnail = await getProjectThumbnail(id)
      return thumbnail
    },
    refetchInterval: 1000 * 60 * 5
  })
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const supabase = createClient()
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      const { data, error } = await supabase
        .from('projects')
        .select(`name, files ( id, short_uid )`)
        .eq('owner', userData.user?.id).order('created_at', { ascending: false })
      if (error) throw error

      const userFiles = data.map(project => ({
        name: project.name,
        fid: project.files[0]?.short_uid
      }))
      return userFiles
    }
  })
}

export const useProjectNameFromDocId = (docId: string) => {
  return useQuery({
    queryKey: ['project', `${docId}`, 'name'],
    queryFn: async () => {
      const project = await getProjectByDocId(docId)
      if (project.success) {
        return project.data?.name
      } else {
        throw project.error
      }
    }
  })
}