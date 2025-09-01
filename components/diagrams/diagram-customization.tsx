"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Settings } from "lucide-react"

interface DiagramCustomizationProps {
  onThemeChange: (theme: string) => void
  onFontSizeChange: (size: number) => void
  onDirectionChange: (direction: string) => void
  onShowGrid: (show: boolean) => void
}

export function DiagramCustomization({
  onThemeChange,
  onFontSizeChange,
  onDirectionChange,
  onShowGrid,
}: DiagramCustomizationProps) {
  const [theme, setTheme] = useState<string>("default")
  const [fontSize, setFontSize] = useState<number>(14)
  const [direction, setDirection] = useState<string>("TD")
  const [showGrid, setShowGrid] = useState<boolean>(false)

  const handleThemeChange = (value: string) => {
    setTheme(value)
    onThemeChange(value)
  }

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0])
    onFontSizeChange(value[0])
  }

  const handleDirectionChange = (value: string) => {
    setDirection(value)
    onDirectionChange(value)
  }

  const handleShowGridChange = (checked: boolean) => {
    setShowGrid(checked)
    onShowGrid(checked)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          Customize
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Diagram Theme</h4>
            <RadioGroup defaultValue={theme} onValueChange={handleThemeChange} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="theme-default" />
                <Label htmlFor="theme-default">Default</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="forest" id="theme-forest" />
                <Label htmlFor="theme-forest">Forest</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutral" id="theme-neutral" />
                <Label htmlFor="theme-neutral">Neutral</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <h4 className="font-medium leading-none">Font Size</h4>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider defaultValue={[fontSize]} max={20} min={10} step={1} onValueChange={handleFontSizeChange} />
          </div>

          <div className="space-y-2">
            <h4 className="font-medium leading-none">Flow Direction</h4>
            <RadioGroup
              defaultValue={direction}
              onValueChange={handleDirectionChange}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="TD" id="direction-td" />
                <Label htmlFor="direction-td">Top-Down</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="LR" id="direction-lr" />
                <Label htmlFor="direction-lr">Left-Right</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="RL" id="direction-rl" />
                <Label htmlFor="direction-rl">Right-Left</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="BT" id="direction-bt" />
                <Label htmlFor="direction-bt">Bottom-Top</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="show-grid" checked={showGrid} onCheckedChange={handleShowGridChange} />
            <Label htmlFor="show-grid">Show Grid</Label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
