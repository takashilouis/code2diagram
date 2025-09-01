"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const diagramTypes = [
  { value: "flowchart", label: "Flowchart" },
  { value: "sequence", label: "Sequence Diagram" },
  { value: "class", label: "Class Diagram" },
]

interface DiagramTypeSelectorProps {
  value?: string
  onChange?: (value: string) => void
}

export function DiagramTypeSelector({ value = "flowchart", onChange }: DiagramTypeSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value)

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === selectedValue ? "" : currentValue
    setSelectedValue(newValue || "flowchart")
    if (onChange) {
      onChange(newValue || "flowchart")
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[180px] justify-between">
          {selectedValue ? diagramTypes.find((type) => type.value === selectedValue)?.label : "Select diagram type..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0">
        <Command>
          <CommandInput placeholder="Search diagram type..." />
          <CommandList>
            <CommandEmpty>No diagram type found.</CommandEmpty>
            <CommandGroup>
              {diagramTypes.map((type) => (
                <CommandItem key={type.value} value={type.value} onSelect={handleSelect}>
                  <Check className={cn("mr-2 h-4 w-4", selectedValue === type.value ? "opacity-100" : "opacity-0")} />
                  {type.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
