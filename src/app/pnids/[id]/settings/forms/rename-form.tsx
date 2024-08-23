'use client'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import { useState, useEffect } from "react"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorBar } from "@/components/forms/errorbar"
import { cn } from "@/lib/utils"
import { getProjectByDocId, revalidateDashboard, updateProjectNameFromDocId } from "@/actions/db/projects"
import { projectSchema, TProjectSchema } from "@/actions/db/schema"
import { useQueryClient } from "@tanstack/react-query"
import sentryHelper from "@/lib/sentry"

export default function RenameForm({docId} : {docId: string}) {
  const [data, setData] = useState<{name: string}>({name: ""})
  const queryClient = useQueryClient()
  
  useEffect(() => {
    getProjectByDocId(docId).then((res) => {
      const name = res.data?.name
      if (name) {
        setData({name: name})
      }
    })
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<TProjectSchema>({
    resolver: zodResolver(projectSchema)
  });

  async function onSubmit(data: TProjectSchema) {
    const result = await updateProjectNameFromDocId(docId, data)
    if (result && !result.success) {
      sentryHelper.logMessage(result.error?.message, true)
      setError("root", { type: "email", message: result.error?.message })
    } else {
      queryClient.invalidateQueries({queryKey: ['project', `${docId}`, 'name']})
      queryClient.invalidateQueries({queryKey: ['projects']})
      revalidateDashboard()
    }
  }

  return (
    <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      <ErrorBar errors={errors}/>
      <div className="grid gap-2 md:grid md:grid-cols-12 space-y-0">
        <Label className="col-span-3 text-sm leading-normal flex flex-col justify-center">Project Name</Label>
        <div className="col-span-9 w-full">
          <Input {...register("name")} placeholder={data?.name} className="w-full" />
          </div>
      </div>
      <div className="w-full flex flex-row justify-end">
        <button className={cn(buttonVariants({variant:"outline"}), "w-min h-min px-4 py-1 text-xs border border-primary bg-primary text-background")} type="submit">Save</button>
      </div>
    </form>
  )
}