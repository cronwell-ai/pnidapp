'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Circle, Plus, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, noRing } from "@/lib/utils"
import { useEditorStore } from '../store';

export default function AddElementDropdown() {
  const { drawingMode, setDrawingMode } = useEditorStore();
  return (
    <>
      {drawingMode &&
        <Button variant="ghost" className='p-1 w-min h-min text-sm font-semibold text-red-600 hover:text-white hover:bg-red-600' onClick={() => { setDrawingMode(null) }}>
          Exit Drawing
        </Button>}
      {!drawingMode && <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn('p-1 w-min h-min font-bold mb-[1px]', noRing)}>
            <Plus className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Shapes</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex justify-start items-center gap-2" onClick={() => { setDrawingMode("rectangle") }}>
            <Square className="w-5 h-5" />
            <p>Rectangle</p>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex justify-start items-center gap-2" onClick={() => { setDrawingMode("circle") }}>
            <Circle className="w-5 h-5" />
            <p>Circle</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>}
    </>
  )
}