'use client'
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";
import Image from "next/image";
import OAuthGrid from "../components/oauth-grid";
import LoginForm from "../components/login-form";


export default function Page() {
  return (
    <div className="h-screen bg-secondary overflow-y-scroll">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Image src="/logo3.png" alt="PNID.app" width={60} height={60} className="mx-auto" />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
            Log in to your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white dark:bg-black px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <LoginForm />
            <OAuthGrid />
          </div>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-200">
            Need a new account? &nbsp;
            <Link href="/auth/signup" className="font-semibold leading-6 text-brand-600 hover:text-brand-500">
              Sign up for free.
            </Link>
          </p>
          <p className="mt-6 text-center text-sm text-gray-500">
            <ThemeToggle />
          </p>
        </div>
      </div>
    </div>
  )
}