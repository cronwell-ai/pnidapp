import { CircleX } from "lucide-react";
import { FieldErrors } from "react-hook-form";
import type { TSignUpSchema } from "@/actions/auth/schemas";

export default function ErrorBar({errors}: {errors: FieldErrors<TSignUpSchema>}) {
  if (Object.values(errors).length === 0) return <></>
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <CircleX aria-hidden="true" className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">There were {Object.values(errors).length} errors with your submission</h3>
          <div className="mt-2 text-sm text-red-700">
            <ul role="list" className="list-disc space-y-1 pl-5">
              {Object.values(errors).map((error, id) => (
                <li key={`err-${id}`}>{error.message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}