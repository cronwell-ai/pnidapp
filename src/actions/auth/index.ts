'use server'

import { revalidatePath } from 'next/cache'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSuperClient } from '@supabase/supabase-js'
import { logInSchema, TLogInSchema, signUpSchema, TSignUpSchema } from './schemas'
import sentryHelper from '@/lib/sentry'

export async function logInAction(payload: TLogInSchema) {
  const supabase = createClient()
  const parse = logInSchema.safeParse(payload);
  if (!parse.success) {
    return { success: false, message: "Bad format for email and password." };
  } else {
    const data = {
      email: parse.data.email,
      password: parse.data.password
    }
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
      return { success: false, message: error.message };
    }
    revalidatePath('/dashboard', 'layout')
    redirect('/dashboard')
    return { success: true, message: "Succeeded in Logging In" };
  }
}

export async function signUpAction(payload: TSignUpSchema) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
  const superUser = createSuperClient(supabaseUrl, supabaseKey);
  const supabase = createClient()
  const parse = signUpSchema.safeParse(payload);
  if (!parse.success) {
    return { success: false, message: "Bad format for email and password." };
  } else {
    const info = {
      email: parse.data.email,
      password: parse.data.password
    }
    const { data, error } = await supabase.auth.signUp(info)
    if (error) {
      return { success: false, message: error.message };
    } else {
      const userAlreadyExists = data.user!.identities!.length == 0;
      // const confirmationSent = data.user!.confirmation_sent_at != null;
      if (userAlreadyExists) {
        return { success: false, message: "User already registered. Please log in." };
      } else {
        const res = await superUser.from('customers').upsert({
          auth_user_id: data.user!.id,
          is_pro: false,
          firstname: parse.data.firstname,
          lastname: parse.data.lastname,
        })
        const customer_error = res.error
        if (customer_error) {
          return { success: false, message: customer_error.message };
        }
      }
      revalidatePath('/dashboard', 'layout')
      redirect('/dashboard')
      return { success: true, message: "Succeeded in Logging In" };
    }
  }
}

export async function signOutAction() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  sentryHelper.logError(error)
  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}


export async function redirectIfNotAuthenticated() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    notFound()
  }
}

export async function isAuthenticated() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return false
  }
  return true
}