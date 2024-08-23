'use client'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpAction } from "@/actions/auth";
import type { TSignUpSchema } from "@/actions/auth/schemas";
import { signUpSchema } from "@/actions/auth/schemas";
import ErrorBar from "../components/error-bar";
import sentryHelper from "@/lib/sentry";

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<TSignUpSchema>({
    resolver: zodResolver(signUpSchema)
  });

  async function submitSignup(data: TSignUpSchema) {
    const result = await signUpAction(data)
    if (result && !result.success) {
      sentryHelper.logMessage(result.message, true)
      setError("root", { type: "email", message: result.message })
    }
  }

  return (
    <form onSubmit={handleSubmit(submitSignup)} className="space-y-6">
      <ErrorBar errors={errors} />
      <div className="flex gap-6">
        <div>
          <label htmlFor="firstname" className="block text-sm font-medium leading-6 text-primary">
            First Name
          </label>
          <div className="mt-2">
            <input
              {...register("firstname", { required: true })}
              id="firstname"
              name="firstname"
              type="text"
              required
              autoComplete="given-name"
              className="block w-full rounded-md border-0 py-1.5 text-primary dark:bg-white/5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div>
          <label htmlFor="lastname" className="block text-sm font-medium leading-6 text-primary">
            Last Name
          </label>
          <div className="mt-2">
            <input
              {...register("lastname", { required: true })}
              id="lastname"
              name="lastname"
              type="text"
              required
              autoComplete="family-name"
              className="block w-full rounded-md border-0 py-1.5 text-primary dark:bg-white/5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>


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
            className="block w-full rounded-md border-0 py-1.5 text-primary dark:bg-white/5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
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
            autoComplete="new-password"
            className="block w-full rounded-md border-0 py-1.5 text-primary dark:bg-white/5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-primary">
          Confirm Password
        </label>
        <div className="mt-2">
          <input
            {...register("confirmPassword", { required: "Password is required" })}
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="block w-full rounded-md border-0 py-1.5 text-primary dark:bg-white/5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 dark:ring-white/10  focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md bg-brand-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Sign up
        </button>
      </div>
    </form>
  )
}