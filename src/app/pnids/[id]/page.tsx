import { CommonHeader } from '@/components/ui/common-header';
import { BreadNav } from "@/app/pnids/components/bread-nav"
import Editor from "@/app/pnids/components/editor"
import { redirectIfNotAuthenticated } from '@/actions/auth';

export default async function Page({ params }: { params: { id: string } }) {
  await redirectIfNotAuthenticated()
  const { id: docId } = params
  return (
    <>
      <CommonHeader leftItem={<BreadNav docId={docId} />} />
      <Editor docId={docId} />
    </>
  )
}