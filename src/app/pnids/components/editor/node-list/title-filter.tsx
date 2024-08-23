'use client'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown } from "lucide-react"
import { noRing, cn } from "@/lib/utils"
import { useEditorStore } from '../store';

export default function TitleFilter() {
  const {filter, setFilter} = useEditorStore();

  const setTitleFilter = (filter: string) => {
    setFilter(filter as "Equipments" | "Valves" | "Instruments" | "Pipes" | "All");
  }

  return (
    <div className="flex items-center gap-1.5">
      <h2 className='text-md font-medium py-2'>{filter}</h2>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn('p-0 w-min h-min border-0', noRing)}>
            <ChevronsUpDown className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value={filter} onValueChange={setTitleFilter}>
            <DropdownMenuRadioItem value="Equipments">Equipments</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Valves">Valves</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Instruments">Instruments</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Pipes">Pipes</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}