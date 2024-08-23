'use client'
import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProjectNameFromDocId } from "@/lib/reactquery/useProject";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { deleteProjectFromDocId, refreshDashboard } from "@/actions/db/projects";
import { useQueryClient } from "@tanstack/react-query";
import sentryHelper from "@/lib/sentry";

export default function DeletionForm({ docId }: { docId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationInput, setConfirmationInput] = useState("");
  const { data: projectName } = useProjectNameFromDocId(docId);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (confirmationInput === projectName) {
      const res = await deleteProjectFromDocId(docId)
      if (res.error) {
        sentryHelper.logError(res.error);
        setError(res.error.message);
      } else {
        queryClient.invalidateQueries({queryKey: ["projects"]});
        setIsOpen(false);
        refreshDashboard();
      }
    } else {
      setError("Project name doesn't match. Deletion cancelled.");
    }
  };

  return (
    <div className="min-h-10 rounded border-red-200 border bg-red-600/5 w-full flex flex-row items-start justify-start gap-4 p-4">
      <div className="bg-red-600 rounded flex items-center justify-center p-1">
        <TriangleAlert className="w-5 h-5 text-white shrink-0" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-md">Delete Project</h3>
        <p className="font-normal text-muted-foreground text-sm">
          Deleting this project will remove the P&ID file and all labeled components.
        </p>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="px-4 py-1 w-min h-min text-xs border-red-200 border bg-red-600/10 hover:bg-red-600/20 mt-4"
            >
              Delete Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] p-4 rounded-sm sm:rounded-sm">
            <DialogHeader>
              <DialogTitle className="text-md">Are you sure you want to delete this project?</DialogTitle>
            </DialogHeader>
            <Separator />
            <Label className="text-sm font-semibold">This action cannot be undone !</Label>
            <Input
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="Type project name here"
            />
            {error ? <p className="text-red-500 text-sm">{error}</p> : null}
            <p className="text-sm text-muted-foreground">Please type the project name <span className="font-semibold italic underline">{projectName}</span>&nbsp; to confirm.</p>
            <Separator className="mt-4" />
            <DialogFooter>
              <Button variant="outline" className="h-min x-min py-1 px-4" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="h-min x-min py-1 px-4" onClick={handleDelete}>
                Delete Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}