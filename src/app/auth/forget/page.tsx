'use client'
import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CircleX, MailCheck } from 'lucide-react'
import { Suspense } from 'react'

function ResetError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  if (error) {
    return <p className='text-destructive text-sm font-semibold flex items-center'>
      <CircleX className='w-4 h-4 mr-2'/> Reset Errors&#58; {error}
    </p>
  } else {
    return <></>
  }
}

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSendResetEmail = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset`
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Password reset email sent. Please check your inbox.')
    }
    setIsLoading(false)
  }

  return (
    <div className="h-screen bg-secondary overflow-y-scroll">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Image src="/logo3.png" alt="PNID.app" width={60} height={60} className="mx-auto" />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
            Forgot Password
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white dark:bg-black px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form onSubmit={handleSendResetEmail} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                  Email address
                </label>
                <div className="mt-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {message && <p className='text-green-500 text-sm font-semibold flex items-center'>
                <MailCheck className='w-4 h-4 mr-2'/>
                {message}
              </p>}
              {error && <p className='text-destructive text-sm font-semibold flex items-center'>
                <CircleX className='w-4 h-4 mr-2'/> {error}
              </p>}
              {!message && !error && <Suspense fallback={<></>}>
                <ResetError />
              </Suspense> }
              <div className='pt-4'>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-md bg-brand-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200"
                >
                  Send Reset Request
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
  )
}