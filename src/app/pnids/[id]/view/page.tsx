import { CommonHeader } from '@/components/ui/common-header';
import { BreadNav } from "@/app/pnids/components/bread-nav"
import { Viewer } from "@/app/pnids/components/editor"
import { getDocIdViewable } from '@/actions/db/projects';
import { redirectIfNotAuthenticated } from '@/actions/auth';

export default async function Page({ params }: { params: { id: string } }) {
  const { id: docId } = params
  await getDocIdViewable(docId).then(async ({result: isViewable}) => {
    if (!isViewable) {
      await redirectIfNotAuthenticated()
    }
  })
  return (
    <>
      <CommonHeader leftItem={<BreadNav docId={docId} />} />
      <Viewer docId={docId} />
    </>
  )
}