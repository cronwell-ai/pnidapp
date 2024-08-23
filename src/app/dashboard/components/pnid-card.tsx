'use client'
import Link from 'next/link';
import { ProjectType } from '@/actions/db/projects';
import { ChevronRight } from 'lucide-react';
import { useProjectThumbnail } from "@/lib/reactquery/useProject"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function PnidCard({ project }: { project: ProjectType }) {
  const { data: thumbnail } = useProjectThumbnail(project.id)
  return (
    <li className="list-none group">
      <Link href={thumbnail?.url || "#"} >
        <Card className='overflow-hidden rounded-sm'>
          <CardContent className="p-0">
            <div className="h-44 max-h-44 overflow-hidden">
              <img src={thumbnail?.img || ''} alt="" className="w-full h-44 max-h-44 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110" />
            </div>
          </CardContent>
          <Separator />
          <CardFooter className='p-3 flex items-center justify-between'>
            <p className="text-sm font-medium group-hover:font-bold">{project.name}</p>
            <Button variant='ghost' className='text-sm font-medium p-0 h-min w-min hover:bg-card'>
              <ChevronRight className='w-4 h-4 transition-transform group-hover:translate-x-2' />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </li>
  )
}