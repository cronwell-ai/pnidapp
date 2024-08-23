'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { createProject, refreshDashboard } from "@/actions/db/projects"
import { useQueryClient } from "@tanstack/react-query"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { noRing, cn } from "@/lib/utils"
import uploadFile from "@/actions/files/upload"
import { useProjects } from "@/lib/reactquery/useProject"
import Constants from "@/constants/settings"

interface FileUploadStepProps {
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const FileUploadStep: React.FC<FileUploadStepProps> = ({ setFile }) => (
  <div className="flex flex-col gap-3 pb-2">
    <Label className="text-sm font-semibold">Step 2: Upload a P&ID file</Label>
    <Input
      type="file"
      accept='image/*,.pdf'
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          setFile(e.target.files[0]);
        }
      }}
      className={cn("-mx-1", noRing)}
    />
    <p className="text-sm text-muted-foreground -mt-2">You may upload a PDF, PNG or JPG file of your P&ID.</p>
  </div>
)

function NewProjectDialog({ setParentOpen }: { setParentOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleNextStep = async () => {
    if (step === 1) {
      setStep(2)
    } else {
      setLoading(true)
      await createProject(name).then((res) => {
        if (res.error) {
          setError(res.error.message)
        } else if (!file) {
          setError('P&ID file is required')
        } else {
          setError(null)
          uploadFile(file, res.data.id, true).then(() => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            queryClient.prefetchQuery({ queryKey: ['projects-thumbnail', `${res.data.id}`] })
            refreshDashboard().then(() => {
              setLoading(false)
              setName('')
              setStep(1)
              setFile(null)
              setParentOpen(false)
            })
          })
        }
      })
    }
  }

  return (
    <DialogContent className="sm:max-w-[425px] p-4 rounded-sm sm:rounded-sm">
      <DialogHeader>
        <DialogTitle className="text-md">Create P&ID Project</DialogTitle>
      </DialogHeader>
      <Separator />
      {error ? <p className="text-red-500 text-sm">{error}</p> : null}
      {step === 1 ? (
        <div className="flex flex-col gap-3 pb-2">
          <Label className="text-sm font-semibold">Step 1: Project Name</Label>
          <Input
            id="name"
            placeholder="Ammonia Facility P&ID P1"
            className={cn("-mx-1", noRing)}
            value={name}
            onChange={(e) => { setName(e.target.value) }}
            autoComplete="off"
          />
          <p className="text-sm text-muted-foreground -mt-2">Please set a title for your P&ID Project</p>
        </div>
      ) : (
        <FileUploadStep setFile={setFile} />
      )}
      <Separator className="mt-4" />
      <DialogFooter>
        <Button
          type="submit"
          variant="outline"
          onClick={handleNextStep}
          className="h-min x-min py-1 px-4 bg-secondary"
          disabled={step === 1 ? name.length < 1 : !file || loading}
        >
          {step === 1 ? "Next step" : loading ? "Uploading ..." : "Create Project"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

function SuggestPaymentDialog({ setParentOpen }: { setParentOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <DialogContent className="sm:max-w-[425px] p-4 rounded-sm sm:rounded-sm">
      <DialogHeader>
        <DialogTitle className="text-md">Upgrade to Pro</DialogTitle>
      </DialogHeader>
      <Separator />
      <p className="text-sm">You have reached the maximum number of free projects. Upgrade to Pro to unlock unlimited projects and more features.</p>
      <Separator className="mt-4" />
      <DialogFooter>
        <Button
          type="submit"
          variant="outline"
          onClick={() => {
            setParentOpen(false)
          }}
          className="h-min x-min py-1 px-4 bg-secondary"
        >
          Upgrade to Pro
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default function NewProject({ triggerElement }: { triggerElement: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useProjects()
  const projectCount = data?.length
  const canCreateProject = !isLoading && projectCount !== undefined && projectCount < Constants.NUM_FREE_PROJECTS
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="flex gap-1 items-center justify-end font-medium hover:font-bold transition-all hover:bg-primary-foreground p-2 rounded-lg">
        {triggerElement}
      </DialogTrigger>
      { canCreateProject && <NewProjectDialog setParentOpen={setOpen} /> }
      { !canCreateProject && <SuggestPaymentDialog setParentOpen={setOpen} /> }
    </Dialog>
  )
}