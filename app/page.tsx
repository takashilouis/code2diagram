"use client"

import { useState } from "react"
import { CodeEditor } from "@/components/code-editor"
import { JsonDiagramDisplay } from "@/components/json-diagram-display"
import { LanguageSelector } from "@/components/language-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useJsonFlowchart } from "@/lib/hooks/use-json-flowchart"
import { Loader2, ArrowRight, AlertTriangle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JsonDiagramHistory } from "@/components/json-diagram-history"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("editor")
  const {
    code,
    setCode,
    language,
    setLanguage,
    flowchartData,
    isGenerating,
    error,
    warning,
    generateFlowchart,
    diagramHistory,
    clearHistory,
    removeFromHistory,
    restoreFromHistory,
  } = useJsonFlowchart()

  const handleGenerateClick = () => {
    console.log("Generate button clicked")
    generateFlowchart()
  }

  return (
    <main className="container mx-auto py-6 px-4 min-h-screen">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">CodeXFlow - JSON Flowchart</h1>
        <p className="text-lg text-muted-foreground text-center max-w-2xl">
          Transform your code into beautiful, D3.js-powered flowcharts using AI
        </p>
        <Badge
          variant="outline"
          className="mt-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        >
          Powered by Google Gemini
        </Badge>
      </div>

      {/* Main content area with code input (35%) and flowchart (65%) */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Code Input Section (35%) */}
        <div className="w-full lg:w-[35%]">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <CardTitle>Code Input</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <LanguageSelector value={language} onChange={setLanguage} />
                </div>
              </div>
              <CardDescription>Paste your code or start typing</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-80px)]">
              <div className="flex-grow mb-4">
                <CodeEditor value={code} onChange={setCode} />
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription className="whitespace-pre-wrap break-words">
                    {error}
                    {(error.includes("AI") || error.includes("timed out") || error.includes("server")) && (
                      <div className="mt-2 text-xs">
                        This might be due to a temporary issue with the AI service. Please try again in a moment.
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleGenerateClick} 
                disabled={isGenerating} 
                className="w-full" 
                size="lg" 
                type="button"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Flowchart
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Flowchart Output Section (65%) */}
        <div className="w-full lg:w-[65%]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Flowchart Output</CardTitle>
              <CardDescription>
                {flowchartData ? "Visualized flowchart of your code" : "Click 'Generate Flowchart' to create a diagram"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {warning && (
                <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800/30 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Note</AlertTitle>
                  <AlertDescription>{warning}</AlertDescription>
                </Alert>
              )}
              <JsonDiagramDisplay flowchartData={flowchartData} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diagram History Section (Below) */}
      <div className="w-full">
        <JsonDiagramHistory
          history={diagramHistory}
          onClearHistory={clearHistory}
          onRemoveItem={removeFromHistory}
          onRestoreItem={(item) => {
            restoreFromHistory(item)
            setActiveTab("editor")
          }}
        />
      </div>
    </main>
  )
}
