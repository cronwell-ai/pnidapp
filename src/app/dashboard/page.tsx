import { CommonHeader, CommonHeaderTitle } from '@/components/ui/common-header';
import { getAccountInfo } from '@/actions/account';
import { ProjectType } from '@/actions/db/projects';
import { createClient } from '@/lib/supabase/server';
import PnidGrid from './components/pnid-grid';

export default async function Page() {
  const supabase = createClient()
  const account = await getAccountInfo()
  const { data, error } = await supabase.auth.getUser().then(
    (res) => {
      return supabase.from('projects').select('*').match({ owner: res.data.user?.id }).order('created_at', { ascending: false });
    }
  );
  const projects = data as ProjectType[];
  const firstname = account.firstname ? account.firstname : '';
  const lastname = account.lastname ? account.lastname : '';
  if (!projects) {
    return <div>Loading...</div>
  }
  return (
    <>
      <CommonHeader leftItem={<CommonHeaderTitle text={`${firstname} ${lastname}'s Projects (${!projects ? 0 : projects.length})`} />} />
      <div className="flex-1 flex-grow overflow-y-auto">
        <div className="p-5">
          <div className="my-6 space-y-8">
            <PnidGrid projects={projects} />
          </div>
        </div>
      </div>
    </>
  )
}