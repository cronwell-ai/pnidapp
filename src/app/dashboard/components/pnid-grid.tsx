'use client'

import { ProjectType } from '@/actions/db/projects';
import { Button } from "@/components/ui/button"
import { ListPlus, Plus } from 'lucide-react';
import NewProject from './new-project';
import PnidCard from './pnid-card';
import { noRing, cn } from '@/lib/utils';

export default function PnidGrid({projects}: {projects: ProjectType[]}) {
  return (
    <div className="space-y-3">
      {projects.length === 0 && <>
        <div className="w-full border-2 p-4 h-96 border-dashed flex items-center justify-center text-muted-foreground">
          <div className="flex flex-col gap-y-2 items-center flex-grow justify-center my-4">
            <ListPlus className="w-8 h-8 text-foreground-light" />
            <div className="flex flex-col gap-y-1">
              <p className="text-md mx-auto text-center font-medium">No Projects Yet</p>
              <p className="text-xs mx-auto text-center">Creating a new project today to start managing your P&IDs.</p>
            </div>
            <NewProject triggerElement={
              <Button variant='outline' className={cn("bg-white dark:bg-black mt-4 h-min w-min p-2 px-4", noRing)}>
                <Plus className="w-4 h-4 mr-1" />
                New Project
              </Button>
            } />
          </div>
        </div>
      </>}
      {projects.length > 0 &&
        <ul className="mx-auto grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 max-w-[2200px] transition-all duration-300 ease-in-out">
          {projects.map((project, index) => (
            <PnidCard key={index} project={project} />
          ))}
          <li className='list-none'>
            <NewProject triggerElement={
              <div className='border-2 border-dashed w-full h-44 max-h-44 rounded-sm flex flex-col items-center justify-center text-border hover:text-muted-foreground hover:border-muted-foreground hover:cursor-pointer'>
                <ListPlus className="w-8 h-8" />
                <div className="flex flex-col gap-y-1">
                  <p className="text-foreground-light text-md mx-auto text-center font-medium">Add P&ID</p>
                </div>
              </div>} />
          </li>
        </ul>}
    </div>
  )
}