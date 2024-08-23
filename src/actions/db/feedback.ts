'use server'
import sentryHelper from "@/lib/sentry";
import { createClient } from "@/lib/supabase/server";

export async function createFeedback(feedback: string, path: string) {
  const supabase = createClient()
  const { data:userData, error:userError } = await supabase.auth.getUser()
  if (userError || !userData) {
    return {
      success: false,
      error: userError ? userError.message : 'User not found'
    }
  } else {
    const { data, error } = await supabase.from('feedback').insert({
      user_id: userData.user.id, // This ensures you're using the authenticated user's ID
      content: feedback,
      path: path
    }).select('*').single()
    if (error) {
      sentryHelper.logError(error)
      return {
        success: false,
        error: error.message
      }
    } else {
      return {
        success: true,
        feedback: data
      }
    }
  }
}