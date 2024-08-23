'use client'
import { useNodeList, type PNIDElementType } from "@/lib/reactquery/useNode"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ArrowUpDown } from "lucide-react"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"
import { ExportButton } from "./export-btn"

interface TableElementType {
  equipment_type: string
  creation_time: Date
  name: string | null
  shape: string
  description: string | null
  verified: boolean
  metadata: any
}

function transformData(data: PNIDElementType[]): TableElementType[] {
  return data.map((d) => {
    const new_metadata = d.metadata ? { ...d.metadata } : null
    if (new_metadata) {
      delete new_metadata.description
    }
    return {
      equipment_type: d.equipment_type,
      creation_time: d.created_at,
      name: d.name,
      shape: d.shape,
      description: d.metadata ? d.metadata.description : null,
      verified: d.verified,
      metadata: new_metadata,
    }
  })
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: userTimeZone,
    hour12: true,
  }).format(date);
}

const columns: ColumnDef<TableElementType>[] = [
  {
    accessorKey: "creation_time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 w-min h-min"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Creation Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("creation_time") as Date
      const formatted = formatDate(date.toLocaleString())
      return (
        <div>{formatted}</div>
      )
    },
  },
  {
    accessorKey: "equipment_type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 w-min h-min"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0 w-min h-min"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string | null
      const formatted = name ? name : "(no name)"
      const muted = name === null || name === ""
      return (
        <div className={cn(muted ? "text-muted-foreground font-normal italic" : "font-medium")}>{formatted}</div>
      )
    },
  },
  {
    accessorKey: "shape",
    header: "Shape",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.getValue("description") as string | null
      const formatted = desc ? desc : "(no description)"
      const muted = desc === null || desc === ""
      return (
        <div className={cn(muted ? "text-muted-foreground font-normal italic" : "font-medium")}>{formatted}</div>
      )
    },
  },
  {
    accessorKey: "metadata",
    header: () => <div className="text-right">Metadata</div>,
    cell: ({ row }) => {
      const metadata = row.getValue("metadata")
      const formatted = metadata ? `${Object.keys(metadata).length} metadata fields` : "(no metadata)"
      const content = metadata ? JSON.stringify(metadata, null, 2) : ""
      const muted = metadata === null
      return (
        <div className="text-right flex justify-end overflow-hidden">
          {muted && <div className={cn("text-right max-w-128 overflow-scroll text-muted-foreground font-normal italic")}>
            {formatted}
          </div>}
          { !muted && 
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn("text-right max-w-128 overflow-scroll font-medium")}>
                  {formatted}
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-left">
                <pre>{content}</pre>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> }
        </div>
      )
    },
  },
]

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default function MainTable({ docId }: { docId: string }) {
  const { data, error, isLoading } = useNodeList(docId)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  if (data) {
    const transformedData = transformData(data)
    return (
      <>
        <div className="container mx-auto p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-medium">Export {data.length} elements</h2>
            <ExportButton docId={docId} setError={setDownloadError} />
          </div>
          {downloadError && <p className="text-red-600 text-sm">{downloadError}</p>}
          <DataTable columns={columns} data={transformedData} />
        </div>
      </>
    )
  } else {
    return (
      <>
        <div className="container mx-auto p-8">
          <div className="mb-4">
            <h2 className="text-xl font-medium">Loading...</h2>
          </div>
        </div>
      </>
    )
  }
}