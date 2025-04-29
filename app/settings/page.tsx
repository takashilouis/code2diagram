"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiKeyInfo } from "@/components/api-key-info"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Trash2, Save, RotateCcw } from "lucide-react"

export default function SettingsPage() {
  const [aiModel, setAiModel] = useState("gemini-1.5-pro")
  const [defaultDiagramType, setDefaultDiagramType] = useState("flowchart")
  const [defaultTheme, setDefaultTheme] = useState("default")
  const [maxHistoryItems, setMaxHistoryItems] = useState(20)
  const [autoSave, setAutoSave] = useState(true)
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [editorFontSize, setEditorFontSize] = useState(14)

  const handleResetSettings = () => {
    setAiModel("gemini-1.5-pro")
    setDefaultDiagramType("flowchart")
    setDefaultTheme("default")
    setMaxHistoryItems(20)
    setAutoSave(true)
    setShowLineNumbers(true)
    setEditorFontSize(14)
  }

  const handleClearLocalStorage = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ApiKeyInfo />

        <Card>
          <CardHeader>
            <CardTitle>AI Model Settings</CardTitle>
            <CardDescription>Configure the AI model used for diagram generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-model">AI Model</Label>
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger id="ai-model">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagram Settings</CardTitle>
            <CardDescription>Configure default diagram options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagram-type">Default Diagram Type</Label>
              <Select value={defaultDiagramType} onValueChange={setDefaultDiagramType}>
                <SelectTrigger id="diagram-type">
                  <SelectValue placeholder="Select diagram type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flowchart">Flowchart</SelectItem>
                  <SelectItem value="sequence">Sequence Diagram</SelectItem>
                  <SelectItem value="class">Class Diagram</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Default Theme</Label>
              <RadioGroup value={defaultTheme} onValueChange={setDefaultTheme}>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Editor Settings</CardTitle>
            <CardDescription>Configure code editor preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-line-numbers">Show Line Numbers</Label>
              <Switch id="show-line-numbers" checked={showLineNumbers} onCheckedChange={setShowLineNumbers} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="editor-font-size">Font Size</Label>
                <span className="text-sm text-muted-foreground">{editorFontSize}px</span>
              </div>
              <Slider
                id="editor-font-size"
                min={10}
                max={24}
                step={1}
                value={[editorFontSize]}
                onValueChange={(value) => setEditorFontSize(value[0])}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save">Auto-save Code</Label>
              <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History Settings</CardTitle>
            <CardDescription>Configure diagram history options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="max-history">Maximum History Items</Label>
                <span className="text-sm text-muted-foreground">{maxHistoryItems}</span>
              </div>
              <Slider
                id="max-history"
                min={5}
                max={50}
                step={5}
                value={[maxHistoryItems]}
                onValueChange={(value) => setMaxHistoryItems(value[0])}
              />
            </div>

            <div className="pt-4 space-y-2">
              <h3 className="text-sm font-medium">Data Management</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearLocalStorage}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetSettings} className="flex items-center gap-1">
                  <RotateCcw className="h-4 w-4" />
                  Reset Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button className="flex items-center gap-1">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
