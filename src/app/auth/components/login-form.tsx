
'use client'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { logInAction } from "@/actions/auth";
import type { TLogInSchema } from "@/actions/auth/schemas";
import { logInSchema } from "@/actions/auth/schemas";
import ErrorBar from "./error-bar";
import Link from "next/link";
import sentryHelper from "@/lib/sentry";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<TLogInSchema>({
    resolver: zodResolver(logInSchema)
  });

  async function submitLogin(data: TLogInSchema) {
    const result = await logInAction(data)
    if (result && !result.success) {
      sentryHelper.logMessage(result.message, true)
      setError("root", { type: "email", message: result.message })
    }
  }

  return (
    <form onSubmit={handleSubmit(submitLogin)} className="space-y-6">
      <ErrorBar errors={errors} />
      <div>
        <label htmlFor="email" className="block text-sm font-medium leading-6 text-primary">
          Email address
        </label>
        <div className="mt-2">
          <input
            {...register("email", { required: "Email is required" })}
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="block w-full rounded-md border-0 py-1.5 text-primary dark:bg-white/5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium leading-6 text-primary">
          Password
        </label>
        <div className="mt-2">
          <input
            {...register("password", { required: "Password is required" })}
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="block w-full rounded-md border-0 py-1.5 text-primary dark:bg-white/5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md bg-brand-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200"
        >
          Sign in
        </button>
        <div className="w-full flex items-center justify-center p-2">
          <Link href="/auth/forget" className="font-semibold text-sm text-brand-800 hover:text-brand-500">
            Forgot password?
          </Link>
        </div>
      </div>
    </form>
  )
}