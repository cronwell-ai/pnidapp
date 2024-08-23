'use client'
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";
import Image from "next/image";
import OAuthGrid from "../components/oauth-grid";
import SignUpForm from "../components/signup-form";

export default function Page() {
  return (
    <div className="h-screen bg-secondary overflow-y-scroll">
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Image src="/logo3.png" alt="PNID.app" width={60} height={60} className="mx-auto" />
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-primary">
            Sign up for new account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white dark:bg-black px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <SignUpForm />
            <OAuthGrid />
          </div>

          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            By signing up, or clicking &ldquo;Sign up with Google&rdquo; or &ldquo;Sign up with GitHub&rdquo;, you agree to our &nbsp;
            <Link href="https://app.termly.io/policy-viewer/policy.html?policyUUID=6d5114ba-94e8-4dd7-9f57-c0058a95361c" className="text-brand-600 hover:text-brand-500">
              Terms and conditions
            </Link>&nbsp;
            and&nbsp;
            <Link href="https://app.termly.io/policy-viewer/policy.html?policyUUID=f9e49e3f-5c01-4173-bd8f-dc4e4fb5c0b6" className="text-brand-600 hover:text-brand-500">
              Privacy Policy
            </Link>.
          </p>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-200">
            Already have an account? &nbsp;
            <Link href="/auth/login" className="font-semibold leading-6 text-brand-600 hover:text-brand-500">
              Please log in.
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