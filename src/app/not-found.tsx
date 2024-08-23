import { ShieldQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center flex flex-col gap-2">
        <ShieldQuestion className="mx-auto h-16 w-16 text-brand-500 mb-4" />
        <h1 className="text-4xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-primary">Page Not Found</h2>
        <p className="text-secondary-foreground">
          Oops! The page you&lsquo;re looking for doesn&lsquo;t exist or has been moved.
        </p>
        <div className="space-x-4 mt-4">
          <Link href="/dashboard">
            <Link type="button" className="justify-center cursor-pointer inline-flex items-center space-x-2 text-center font-medium ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border bg-brand-400 dark:bg-brand-500 hover:bg-brand/80 dark:hover:bg-brand/50 border-brand-500/75 dark:border-brand/30 hover:border-brand-600 dark:hover:border-brand focus-visible:outline-brand-600 data-[state=open]:bg-brand-400/80 dark:data-[state=open]:bg-brand-500/80 data-[state=open]:outline-brand-600 text-sm px-4 py-2 h-[38px] text-white" href="/auth/signup">
              <span>To dashboard</span>
            </Link>
          </Link>
        </div>
      </div>
    </div>
  );
}
