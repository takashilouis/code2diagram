"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface JsonDiagramCustomizationProps {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}

export function JsonDiagramCustomization({
  theme,
  setTheme,
}: JsonDiagramCustomizationProps) {
  const [fontSize, setFontSize] = useState<number>(14)
  const [nodeSpacing, setNodeSpacing] = useState<number>(70)
  const [edgeThickness, setEdgeThickness] = useState<number>(2)
  const [showLabels, setShowLabels] = useState<boolean>(true)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Theme</Label>
        <RadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as "light" | "dark")}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="theme-dark" />
            <Label htmlFor="theme-dark">Dark</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="theme-light" />
            <Label htmlFor="theme-light">Light</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Font Size: {fontSize}px</Label>
        </div>
        <Slider
          value={[fontSize]}
          min={10}
          max={20}
          step={1}
          onValueChange={(value) => setFontSize(value[0])}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Node Spacing: {nodeSpacing}px</Label>
        </div>
        <Slider
          value={[nodeSpacing]}
          min={30}
          max={120}
          step={10}
          onValueChange={(value) => setNodeSpacing(value[0])}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Edge Thickness: {edgeThickness}px</Label>
        </div>
        <Slider
          value={[edgeThickness]}
          min={1}
          max={4}
          step={0.5}
          onValueChange={(value) => setEdgeThickness(value[0])}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="show-labels"
          checked={showLabels}
          onCheckedChange={setShowLabels}
        />
        <Label htmlFor="show-labels">Show Edge Labels</Label>
      </div>
    </div>
  )
}
