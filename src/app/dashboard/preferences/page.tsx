import { CommonHeader, CommonHeaderTitle } from '@/components/ui/common-header';

import ProfileForm from "./forms/profile-form"
import AppearanceForm from "./forms/appearance-form"
import DataCollectionForm from "./forms/data-collection-form"
import AccountDeletionForm from "./forms/account-deletion-form"
import BillingForm from './forms/billing-form';
import { createClient } from '@/lib/supabase/server';
import ContactForm from './forms/contactform';

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

export default async function Page() {
  const supabase = createClient()
  const { data: userData, error } = await supabase.auth.getUser()
  return (
    <>
      <CommonHeader leftItem={<CommonHeaderTitle text="Preferences" />} />
      <div className="flex-1 flex-grow overflow-y-scroll py-2 bg-background max-h-full">
        <article className="max-w-4xl p-4 mx-auto">
          <SettingsSection title="Account Information">
            <ProfileForm />
          </SettingsSection>
          {/* <SettingsSection title="Profile Information">
            <ProfileForm />
          </SettingsSection> */}
          {/* <SettingsSection title="Profile Picture">
            <AvatarForm />
          </SettingsSection> */}
          <SettingsSection title="Usage & Billing">
            <BillingForm />
          </SettingsSection>
          <SettingsSection title="Appearance">
            <AppearanceForm />
          </SettingsSection>
          <SettingsSection title="Data Collection">
            <DataCollectionForm />
          </SettingsSection>
          { userData.user != null && <SettingsSection title="Danger Zone">
            <AccountDeletionForm userEmail={userData.user.email} />
          </SettingsSection> }
          <SettingsSection title="Contact Us">
            <ContactForm />
          </SettingsSection>
        </article>
      </div>
    </>
  )
}