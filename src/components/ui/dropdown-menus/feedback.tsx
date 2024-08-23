'use client'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Button } from "../button"
import { Textarea } from "../textarea"
import { useRef, useState } from "react"
import { createFeedback } from "@/actions/db/feedback"
import { usePathname } from "next/navigation"

export default function FeedbackDropdown({ triggerElement }: { triggerElement: React.ReactNode }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const pathname = usePathname()

  function clearFeedback() {
    if (textareaRef.current) {
      textareaRef.current.value = ''
    }
    setError(null)
    setSuccess(null)
  }

  function handleCancel() {
    setOpen(false)
    clearFeedback()
  }

  async function submitFeedback() {
    if (textareaRef.current) {
      const res = await createFeedback(textareaRef.current.value, pathname)
      if (res.error) {
        setSuccess(null)
        setError(res.error)
      } else {
        setError(null)
        setSuccess('Feedback sent!')
        setTimeout(() => {
          setOpen(false)
          clearFeedback()
        }, 1000)
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerElement}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1 overflow-hidden">
        <Textarea className="w-full h-24 p-2" placeholder="Idea on how to improve this page..." ref={textareaRef} />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {success && <p className="text-xs text-green-500">{success}</p>}
        <Separator className="w-100 my-1 -mx-1" />
        <div className="flex flex-row justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" className="px-2 py-1 h-min w-min text-xs" onClick={handleCancel}>Cancel</Button>
            <Button variant="outline" className="px-2 py-1 h-min w-min text-xs" onClick={clearFeedback}>Clear</Button>
          </div>
          <Button variant="outline" className="px-2 py-1 h-min w-min text-xs" onClick={submitFeedback}>Send</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
