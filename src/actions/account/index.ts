'use server'
import { createClient } from '@/lib/supabase/server'
import { TAccountSchema } from '@/actions/account/schemas'
import { revalidatePath } from 'next/cache';
import sentryHelper from '@/lib/sentry';

export async function getAccountInfo() {
  const supabase = createClient()
  const res = await supabase.auth.getUser();
  const user = res.data?.user

  const { data, error } = await supabase.from('customers').select('*').eq('auth_user_id', user?.id).single()
  if (error) {
    sentryHelper.logError(error)
    return {
      email: user?.email,
      firstname: '',
      lastname: '',
      errors: error
    }
  }

  return {
    email: user?.email,
    firstname: data.firstname,
    lastname: data.lastname,
    errors: null
  }
}

export async function updateAccount(data: TAccountSchema) {
  const supabase = createClient()
  const res = await supabase.auth.getUser();
  const user = res.data?.user

  const { firstname, lastname } = data
  const { error } = await supabase.from('customers').update({
    firstname,  lastname
  }).eq('auth_user_id', user?.id)

  if (error) {
    sentryHelper.logError(error)
    return {
      success: false,
      message: error.message
    }
  } else {
    revalidatePath('/preferences')
    return {
      success: true
    }
  }
}

export type ProfileFormType = {
  email: string | undefined;
  firstname: string;
  lastname: string;
  errors: any;
}
