'use client'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import { getAccountInfo, updateAccount } from "@/actions/account"
import { useState, useEffect } from "react"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema, TAccountSchema } from "@/actions/account/schemas";
import { ErrorBar } from "@/components/forms/errorbar"
import { cn } from "@/lib/utils"
import { ProfileFormType } from "@/actions/account"
import sentryHelper from "@/lib/sentry"

export default function ProfileForm() {
  const [data, setData] = useState<ProfileFormType>({email: "", firstname: "", lastname: "", errors: undefined})
  
  useEffect(() => {
    getAccountInfo().then((res) => {
      setData({email: res.email, firstname: res.firstname, lastname: res.lastname, errors: res.errors})
    })
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<TAccountSchema>({
    resolver: zodResolver(accountSchema)
  });

  async function onSubmit(data: TAccountSchema) {
    const result = await updateAccount(data)
    if (result && !result.success) {
      sentryHelper.logMessage(result.message, true)
      setError("root", { type: "email", message: result.message })
    }
  }

  return (
    <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      <ErrorBar errors={errors}/>
      <div className="grid gap-2 md:grid md:grid-cols-12 space-y-0">
        <Label className="col-span-3 text-sm leading-normal flex flex-col justify-center">Email</Label>
        <div className="col-span-9 w-full relative group">
          <Input {... register("email")} value={data?.email} disabled aria-describedby="email-description" />
          <p
            id="email-description"
            className="text-xs text-muted-foreground absolute left-0 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-50"
          >
            We currently do not support email resets. Please contact support at <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} className="font-semibold underline">{`${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}</a>.
          </p>
        </div>
      </div>
      <div className="grid gap-2 md:grid md:grid-cols-12 space-y-0">
        <Label className="col-span-3 text-sm leading-normal flex flex-col justify-center">First name</Label>
        <div className="col-span-9 w-full">
          <Input {...register("firstname")} placeholder={data?.firstname} className="w-full" />
          </div>
      </div>
      <div className="grid gap-2 md:grid md:grid-cols-12 space-y-0">
        <Label className="col-span-3 text-sm leading-normal flex flex-col justify-center">Last name</Label>
        <div className="col-span-9 w-full">
          <Input {... register("lastname")} placeholder={data?.lastname} className="w-full" />
          </div>
      </div>
      <div className="w-full flex flex-row justify-end">
        <button className={cn(buttonVariants({variant:"outline"}), "w-min h-min px-4 py-1 text-xs border border-primary bg-primary text-background")} type="submit">Save</button>
      </div>
    </form>
  )
}