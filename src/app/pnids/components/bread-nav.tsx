'use client'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ChevronRight, ChevronsUpDown } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn, noRing } from "@/lib/utils"
import { useProjects, useProjectNameFromDocId } from "@/lib/reactquery/useProject"

export function BreadNav({ docId }: { docId: string }) {
  const { data } = useProjects()
  const { data: projectName } = useProjectNameFromDocId(docId)
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">All Projects</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage className='font-medium'>
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "flex items-center gap-1 h-min w-min py-1 px-2", noRing)}>
                {projectName}
                <ChevronsUpDown className='w-3 h-3 ml-1' />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {data?.map((p) => (
                  <Link href={`/pnids/${p.fid}`} key={p.fid}>
                    <DropdownMenuItem>
                      <p className={cn(p.fid == docId ? "font-semibold" : "font-normal")}>
                        <span className={cn(p.fid == docId ? "inline" : "invisible")}>&bull;&nbsp;&nbsp;</span>
                        {p.name}
                      </p>
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}