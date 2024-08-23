'use client'
import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { getAccountInfo } from "@/actions/account";
import { signOutAction } from "@/actions/auth";
import sentryHelper from "@/lib/sentry";

async function sendAccountDeletionEmail(email: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data || data.user?.email !== email) {
      throw new Error("Failed to get user data.");
    }
    const res = await getAccountInfo()
    if (res.errors || res.email !== email) {
      throw new Error("Failed to get user data.");
    } else {
      const response = await fetch("/api/auth/delaccount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: res.email,
          userFirstName: res.firstname,
          userId: data.user?.id,
        }),
      });
      if (response.ok) {
        return { success: true, error: null };
      } else {
        throw new Error("Failed to delete account.");
      }
    }
  } catch (error: any) {
    sentryHelper.logError(error);
    return { success: false, error: "Failed to delete account. Please try again later." };
  }
}

function AccountDeletionDialog({ email }: { email: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [countdown, setCountdown] = useState(-1);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        setMessage(`Account deletion email sent to the support team. You will receive a confirmation email shortly. Logging out in ${countdown} seconds`);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Perform logout action here
    }
  }, [countdown]);

  const handleDelete = async () => {
    if (confirmationInput === email) {
      const { success, error } = await sendAccountDeletionEmail(email);
      if (success) {
        setCountdown(10);
        setTimeout(() => {
          setMessage(null)
          setCountdown(-1);
          signOutAction()
          setIsOpen(false);
        }, 10000);
      } else {
        setError(error);
      }
      setError(null);
    } else {
      setError("User email doesn't match. Deletion cancelled.");
    }
  };


  return (<Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogTrigger asChild>
      <Button variant="outline" className="px-4 py-1 w-min h-min text-xs border-red-200 border bg-red-600/10 hover:bg-red-600/20 mt-4">Request to delete account</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px] p-4 rounded-sm sm:rounded-sm">
      <DialogHeader>
        <DialogTitle className="text-md">Are you sure you want to delete this account?</DialogTitle>
      </DialogHeader>
      <Separator />
      <Label className="text-sm">Upon approval, your account information, P&ID projects, and all P&ID labels will be deleted immediately!</Label>
      <Input
        value={confirmationInput}
        onChange={(e) => setConfirmationInput(e.target.value)}
        placeholder="Type project name here"
      />
      {error ? <p className="text-red-500 text-sm">{error}</p> : null}
      {message ? <p className="text-green-500 text-sm">{message}</p> : null}
      <p className="text-sm text-muted-foreground">Please type your email <span className="font-semibold italic underline">{email}</span>&nbsp; to confirm.</p>
      <Separator className="mt-4" />
      <DialogFooter>
        <Button variant="outline" className="h-min x-min py-1 px-4" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button variant="destructive" className="h-min x-min py-1 px-4" onClick={handleDelete}>
          Delete Account
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>)
}

export default function AccountDeletionForm({ userEmail }: { userEmail: string | undefined }) {
  return (
    <div className="min-h-10 rounded border-red-200 border bg-red-600/5 w-full flex flex-row items-start justify-start gap-4 p-4">
      <div className="bg-red-600 rounded flex items-center justify-center p-1">
        <TriangleAlert className="w-5 h-5 text-white shrink-0" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-md">Request for Account Deletion</h3>
        <p className="font-normal text-muted-foreground text-sm">Deleting your account is permanent and cannot be undone. Your data will be deleted within 30 days, except we may retain some metadata and logs for longer where required or permitted by law.</p>
        {userEmail && <AccountDeletionDialog email={userEmail} />}
      </div>
    </div>
  )
}