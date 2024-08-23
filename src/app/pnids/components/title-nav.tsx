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

import { ChevronRight } from 'lucide-react'
import { useProjectNameFromDocId } from "@/lib/reactquery/useProject"


export default function TitleNav({ docId, title }: { docId: string, title: string }) {
  const { data, error } = useProjectNameFromDocId(docId)
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
        {!error && <>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/pnids/${docId}`}>{data}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight />
          </BreadcrumbSeparator></>
        }
        <BreadcrumbItem>
          <BreadcrumbPage className='font-medium'>
            {title}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}