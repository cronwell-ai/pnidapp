import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSuperClient } from '@supabase/supabase-js'
import sentryHelper from '@/lib/sentry'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
  const superUser = createSuperClient(supabaseUrl, supabaseKey);

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {data: userData, error: userError} = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        sentryHelper.logError(userError)
      } else {
        const user = userData.user
        const res = await supabase.from('customers').select().eq('auth_user_id', user.id)
        const { data: customerData, error: customerError } = res
        if (customerError) {
          sentryHelper.logError(customerError)
        } else if (customerData.length === 0) {
          // create a new customer record
          const { error: newCustomerError } = await superUser.from('customers').upsert({
            auth_user_id: user.id,
            is_pro: false,
            firstname: user.user_metadata?.full_name,
          })
          if (newCustomerError) {
            sentryHelper.logError(newCustomerError)
          }
        }
      }
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}