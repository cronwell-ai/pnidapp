'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TProjectSchema } from './schema'
import { genShortId } from '@/lib/utils'
import sentryHelper from '@/lib/sentry'

export interface ProjectType {
  id: string;
  name: string;
  thumbnail: string;
  created_at: string;
}

export async function createProject(name: string) {
  const supabase = createClient()
  const res = await supabase.auth.getUser();
  const user = res.data?.user
  const { data, error } = await supabase.from('projects').insert({
    short_uid: genShortId(),
    name: name,
    owner: user?.id
  }).select('*').single()
  if (error) {
    sentryHelper.logError(error)
    return {
      success: false,
      data,
      error
    }
  } else {
    return {
      success: true,
      data,
    }
  }
}

export async function refreshDashboard() {
  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function revalidateDashboard() {
  revalidatePath('/dashboard', 'layout')
}

export async function deleteProjectFromDocId(docId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('files').select('*').match({ short_uid: docId }).single()
  if (error) {
    return {
      success: false,
      error
    }
  }
  const { error: projectError } = await supabase.from('projects').delete().match({ id: data.project })
  if (projectError) {
    return {
      success: false,
      error: projectError
    }
  }
  return {
    success: true,
    error: null
  }
}

export async function getProjectThumbnail(id: string): Promise<{ img: string | undefined, url: string } | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('files').select('short_uid, thumbnail').match({ project: id, ispnid: true }).limit(1).single()
  if (error || !data) {
    sentryHelper.logError(error)
    return null
  }
  const { data: thumbnailData, error: thumbnailError } = await supabase
    .storage
    .from('thumbnails')
    .createSignedUrl(data.thumbnail, 600)
  sentryHelper.logError(thumbnailError)
  const url = `/pnids/${data.short_uid}`
  return { img: thumbnailData?.signedUrl, url: url }
}

export async function addFileToProject(projectId: string, fileName: string, filePath: string, ispnid: boolean, width: number, height: number, ftype?: string, thumbnailUrl?: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('files').insert(
    {
      short_uid: genShortId(),
      name: fileName,
      ispnid: ispnid,
      thumbnail: thumbnailUrl,
      fpath: filePath,
      project: projectId,
      width: Math.ceil(width),
      height: Math.ceil(height),
      ftype: ftype
    }
  )
  if (error) {
    sentryHelper.logError(error)
    return { success: false, data, error }
  } else {
    revalidatePath(`/projects/${projectId}`, 'layout')
    return { success: true, data, error }
  }
}

export async function getProjectByDocId(docId: string) {
  const supabase = createClient()

  const { data: docData, error: docError } = await supabase.from('files').select('project').match({ short_uid: docId }).single()
  if (docError) {
    sentryHelper.logError(docError)
    return {
      success: false,
      data: null,
      error: docError
    }
  }
  const { data: projectData, error: projectError } = await supabase.from('projects').select('*').match({ id: docData.project }).single()
  if (projectError) {
    return {
      success: false,
      data: null,
      error: projectError
    }
  }

  return {
    success: true,
    data: projectData as ProjectType,
    error: null
  }
}

export async function getDocIdViewable(docId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from('files').select('viewable').match({ short_uid: docId }).single()
  if (error) {
    sentryHelper.logError(error)
    return { result: false, error: error }
  }

  return { result: data.viewable as boolean, error: null }
}

export async function updateDocIdViewable(docId: string, viewable: boolean) {
  const supabase = createClient()

  const { data, error } = await supabase.from('files').update({ viewable: viewable }).match({ short_uid: docId }).select('project').single()
  if (error) {
    return { success: false, error: error }
  }
  const { error: projectError } = await supabase.from('projects').update({ viewable: viewable }).match({ id: data.project }).single()
  if (projectError) {
    return { success: false, error: projectError }
  }
  return { success: true, error: null }
}

export async function updateProjectNameFromDocId(docId: string, data: TProjectSchema) {
  const supabase = createClient()

  const { data: docData, error: docError } = await supabase.from('files').select('*').match({ short_uid: docId }).single()
  if (docError) {
    return {
      success: false,
      error: docError
    }
  }
  const { error: projectError } = await supabase.from('projects').update({ name: data.name }).match({ id: docData.project })
  if (projectError) {
    return {
      success: false,
      error: projectError
    }
  }

  return {
    success: true,
    error: null
  }
}