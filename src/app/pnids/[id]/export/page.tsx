import { CommonHeader } from '@/components/ui/common-header';
import TitleNav from "@/app/pnids/components/title-nav"
import MainTable from './main-table';
import { redirectIfNotAuthenticated } from '@/actions/auth';

export default async function Page({ params }: { params: { id: string } }) {
  await redirectIfNotAuthenticated()
  const [docId] = [params.id]
  return (
    <>
      <CommonHeader leftItem={<TitleNav docId={docId} title='Export Project' />} />
      <div className="flex-1 flex-grow overflow-y-scroll py-2 bg-background max-h-full">
        <MainTable docId={docId} />
      </div>
    </>
  )
}