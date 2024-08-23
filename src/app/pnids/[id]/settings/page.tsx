import { CommonHeader } from '@/components/ui/common-header';
import RenameForm from "./forms/rename-form"
import DeletionForm from "./forms/deletion-form"
import TitleNav from "@/app/pnids/components/title-nav"
import ViewableForm from './forms/viewable-form';
import { redirectIfNotAuthenticated } from '@/actions/auth';

function SettingsSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-card rounded-md border shadow-sm overflow-hidden mb-8">
      <div className="bg-white dark:bg-card border-b flex items-center px-6 py-4 font-medium">
        <h5>{`${title}`}</h5>
      </div>
      <div className="px-6 py-4">
        <div className="text-sm flex flex-row gap-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default async function Page({ params }: { params: { id: string } }) {
  await redirectIfNotAuthenticated()
  const { id: docId } = params
  return (
    <>
      <CommonHeader leftItem={<TitleNav docId={docId} title='Settings'/>} />
      <div className="flex-1 flex-grow overflow-y-scroll py-2 bg-background max-h-full">
        <article className="max-w-4xl p-4 mx-auto">
          <SettingsSection title="Rename Project">
            <RenameForm docId={docId}/>
          </SettingsSection>
          <SettingsSection title="General Settings">
            <ViewableForm docId={docId}/>
          </SettingsSection>
          <SettingsSection title="Danger Zone">
            <DeletionForm docId={docId}/>
          </SettingsSection>
        </article>
      </div>
    </>
  )
}