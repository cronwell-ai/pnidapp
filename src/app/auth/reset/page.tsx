import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Input } from "@/components/ui/input"
import Link from 'next/link'

async function updatePassword(code: string, formData: FormData) {
  'use server'
  if (!formData) {
    redirect('/auth/forget?error=' + encodeURIComponent('Missing form data'))
  }
  const newPassword = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (newPassword !== confirmPassword) {
    redirect('/auth/forget?error=' + encodeURIComponent('Passwords do not match'))
  }

  const supabase = createClient()
  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
  if (sessionError) {
    redirect('/auth/forget?error=' + encodeURIComponent(sessionError.message))
  } else {
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) {
      redirect('/auth/forget?error=' + encodeURIComponent(updateError.message))
    }
    revalidatePath('/')
    redirect('/dashboard')
  }
}

export default async function Page({ searchParams }: { searchParams: { code: string } }) {
  const { code } = searchParams

  if (!code) {
    return (
      <div className="h-screen bg-secondary flex items-center justify-center">
        <div className="bg-white dark:bg-black p-8 shadow sm:rounded-lg">
          <h1 className="text-2xl font-bold text-destructive mb-4">Missing Code</h1>
          <p className="text-gray-600 dark:text-gray-400">There was an error with the auth code.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-secondary overflow-y-scroll">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Image src="/logo3.png" alt="PNID.app" width={60} height={60} className="mx-auto" />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
            Reset Your Password
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white dark:bg-black px-6 py-6 shadow sm:rounded-lg sm:px-12">
            <form action={updatePassword.bind(null, code)} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                  New Password
                </label>
                <div className="mt-2">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="block w-full rounded-md border-0 py-1.5 text-primary dark:bg-white/5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                  Confirm Password
                </label>
                <div className="mt-2">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="block w-full rounded-md border-0 py-1.5 text-primary dark:bg-white/5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className='py-4'>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-brand-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200"
                >
                  Reset Password
                </button>
                <div className="w-full flex items-center justify-center p-2">
                  <Link href="/auth/login" className="font-semibold text-sm text-brand-800 hover:text-brand-500">
                    Back to login
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}