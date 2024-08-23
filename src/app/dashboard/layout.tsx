import type { Metadata } from "next";
import Link from "next/link"
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GlobalNav from "./components/global-nav";
import Image from "next/image";

function LayoutTitle({ text }: { text: string }) {
  return (
    <div className="mb-2">
      <div className="flex h-12 max-h-12 items-center border-b px-6 border-default">
        <Link href="/dashboard">
          <h4 className="mb-0 text-sm font-semibold truncate flex flex-row items-center justify-begin gap-2.5" title={text}>
            <Image src="/logo3.png" alt="PNID.app" width={20} height={20} className="mx-auto" />
            {`${text}`}
          </h4>
        </Link>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: "Dashboard | P&ID App",
  description: "Label P&ID diagrams for better understanding"
};

export default async function Dashboard({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login')
  }
  return <div className="h-screen min-h-[0px] basis-0 flex-1 overflow-hidden max-h-screen">
    <div className="flex h-full">
      <div className="h-full bg-studio hide-scrollbar w-64 overflow-auto border-r border-default">
        <LayoutTitle text="P&ID.app" />
        <GlobalNav />
      </div>
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </div>
  </div>
}