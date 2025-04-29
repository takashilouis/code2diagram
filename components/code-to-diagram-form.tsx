"use client"

import { useEffect } from "react"
import { CodeEditor } from "@/components/code-editor"
import { DiagramDisplay } from "@/components/diagram-display"
import { LanguageSelector } from "@/components/language-selector"
import { DiagramTypeSelector } from "@/components/diagram-type-selector"
import { TestDiagram } from "@/components/test-diagram"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCodeToDiagram } from "@/lib/hooks/use-code-to-diagram"
import { Loader2, ArrowRight, AlertTriangle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CodeToDiagramForm() {
  const {
    code,
    setCode,
    language,
    setLanguage,
    diagramType,
    setDiagramType,
    diagram,
    isGenerating,
    error,
    warning,
    generateDiagram,
  } = useCodeToDiagram()

  const handleGenerateClick = () => {
    console.log("Generate button clicked")
    generateDiagram()
  }
  
  // Debug the diagram data
  useEffect(() => {
    console.log("CodeToDiagramForm diagram state:", {
      diagramExists: !!diagram,
      diagramLength: diagram?.length || 0,
      diagramPreview: diagram?.substring(0, 50),
      isGenerating,
      error: error || 'none'
    })
  }, [diagram, isGenerating, error])

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="col-span-1">
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <CardTitle>Code Input</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <LanguageSelector value={language} onChange={setLanguage} />
              <DiagramTypeSelector value={diagramType} onChange={setDiagramType} />
            </div>
          </div>
          <CardDescription>Paste your code or start typing</CardDescription>
        </CardHeader>
        <CardContent>
          <CodeEditor value={code} onChange={setCode} />

          {error && (
            <Alert variant="destructive" className="mt-4">
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

          <div className="mt-4">
            <Button onClick={handleGenerateClick} disabled={isGenerating} className="w-full" size="lg" type="button">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Diagram
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>
            {diagramType === "sequence" ? "Sequence Diagram" : diagramType === "class" ? "Class Diagram" : "Flowchart"}{" "}
            Output
          </CardTitle>
          <CardDescription>
            {diagram ? "Visualized diagram of your code" : "Click 'Generate Diagram' to create a diagram"}
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
          <DiagramDisplay diagram={diagram} diagramType={diagramType} />
        </CardContent>
      </Card>
    </div>
  )
}
