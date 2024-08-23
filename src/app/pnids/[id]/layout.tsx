import type { Metadata } from "next";
import { isAuthenticated } from "@/actions/auth"
import Nav from "@/app/pnids/components/nav"
import { getProjectByDocId } from "@/actions/db/projects";
 
export async function generateMetadata(
  { params } : { params: { id: string } }
): Promise<Metadata> {
  const { id } = params
  return getProjectByDocId(id).then((res) => {
    const { success, data } = res
    if (success && data) {
      return {
        title: `${data.name} | P&ID.app`,
        description: `P&ID.app`
      } as Metadata
    } else {
      return {
        title: `P&ID | P&ID.app`,
        description: `P&ID.app`
      } as Metadata
    }
  })
}


export default async function Dashboard({ children, params }: { children: React.ReactNode, params: { id: string } }) {
  const hasAuth = await isAuthenticated()
  const { id } = params
  return <div className="h-screen min-h-[0px] basis-0 flex-1 overflow-hidden max-h-screen">
    <div className="flex h-full">
      {hasAuth && <div className="w-14 h-full flex flex-col">
        <Nav docId={id} />
      </div>}
      <div className="flex flex-1 flex-col">
        {children}
      </div>
    </div>
  </div>
}