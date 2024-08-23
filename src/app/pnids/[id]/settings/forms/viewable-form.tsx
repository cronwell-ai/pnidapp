'use client'
import { getDocIdViewable, updateDocIdViewable } from "@/actions/db/projects"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"

export default function ViewableForm({docId}: {docId: string}) {
  const [isViewable, setIsViewable] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    getDocIdViewable(docId).then((res) => {
      setIsViewable(res.result)
      if (res.error) {
        setError(res.error.message)
      }
    })
  }, [])

  const updateViewable = (viewable: boolean) => {
    updateDocIdViewable(docId, viewable).then((res) => {
      if (res.success) {
        setIsViewable(viewable)
      } else if (res.error) {
        setError(res.error.message)
      }
    })
  }
  return (
    <form id="profile-form" className="space-y-6 w-full">
      <div className="grid gap-2 md:grid md:grid-cols-12 space-y-0">
        <div className="col-span-3 text-sm leading-normal flex flex-col justify-center">
          <Switch checked={isViewable} onCheckedChange={updateViewable} />
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
        <div className="col-span-9 flex flex-col gap-1">
          <h3 className="font-medium text-md">Make Viewing Public</h3>
          <p className="font-normal text-muted-foreground text-sm">Anyone with the link of this project viewing page can view the P&ID</p>
        </div>
      </div>
    </form>
  )
}