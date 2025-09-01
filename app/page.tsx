"use client"

import { useState } from "react"
import { CodeEditor } from "@/components/code-editor"
import { IdeasEditor } from "@/components/ideas-editor"
import { JsonDiagramDisplay } from "@/components/json-diagram-display"
import { LanguageSelector } from "@/components/language-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { JsonFlowchart } from "@/components/json-flowchart"
import { SequenceDiagram } from "@/components/sequence-diagram"
import { useJsonFlowchart } from "@/lib/hooks/use-json-flowchart"
import { useIdeasToSequence } from "@/lib/hooks/use-ideas-to-sequence"
import { Loader2, ArrowRight, AlertTriangle, AlertCircle, FileText, Code } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JsonDiagramHistory } from "@/components/json-diagram-history"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("code")
  const [activeInputTab, setActiveInputTab] = useState<string>("code")
  
  // Hook for code to flowchart
  const {
    code,
    setCode,
    language,
    setLanguage,
    flowchartData: codeFlowchartData,
    isGenerating: isGeneratingCode,
    error: codeError,
    warning: codeWarning,
    generateFlowchart,
    diagramHistory: codeHistory,
    clearHistory: clearCodeHistory,
    removeFromHistory: removeCodeFromHistory,
    restoreFromHistory: restoreCodeFromHistory,
  } = useJsonFlowchart()

  // Hook for ideas to sequence diagram
  const {
    ideas,
    setIdeas,
    flowchartData: ideasFlowchartData,
    isGenerating: isGeneratingIdeas,
    error: ideasError,
    warning: ideasWarning,
    generateSequence,
    diagramHistory: ideasHistory,
    clearHistory: clearIdeasHistory,
    removeFromHistory: removeIdeasFromHistory,
    restoreFromHistory: restoreIdeasFromHistory,
  } = useIdeasToSequence()

  // Combined flowchart data based on active tab
  const flowchartData = activeInputTab === "code" ? codeFlowchartData : ideasFlowchartData
  const error = activeInputTab === "code" ? codeError : ideasError
  const warning = activeInputTab === "code" ? codeWarning : ideasWarning
  const isGenerating = activeInputTab === "code" ? isGeneratingCode : isGeneratingIdeas

  const handleGenerateCodeClick = () => {
    console.log("Generate flowchart button clicked")
    generateFlowchart()
  }

  const handleGenerateIdeasClick = () => {
    console.log("Generate sequence diagram button clicked")
    generateSequence()
  }

  return (
    <main className="container mx-auto py-6 px-4 min-h-screen">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">CodeXFlow</h1>
        <p className="text-lg text-muted-foreground text-center max-w-2xl">
          Transform your ideas/code into beautiful diagrams using AI
        </p>
        <Badge
          variant="outline"
          className="mt-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        >
          Powered by Google Gemini
        </Badge>
      </div>

      {/* Main content area with input tabs (35%) and diagram output (65%) */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Input Section (35%) */}
        <div className="w-full lg:w-[35%]">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <CardTitle>Input</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant={activeInputTab === "code" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      console.log("Switching to Code tab");
                      setActiveInputTab("code");
                    }}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Code
                  </Button>
                  <Button 
                    variant={activeInputTab === "ideas" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      console.log("Switching to Ideas tab");
                      setActiveInputTab("ideas");
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ideas
                  </Button>
                </div>
              </div>
              <CardDescription>
                {activeInputTab === "code" 
                  ? "Paste your code or start typing" 
                  : "Describe your ideas for a sequence diagram"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-80px)]">
              {/* No debug info needed */}
              {activeInputTab === "code" ? (
                <div className="flex flex-col">
                  <form 
                    className="flex flex-col flex-grow" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleGenerateCodeClick();
                    }}
                  >
                    <div className="flex gap-2 flex-wrap mb-2">
                      <LanguageSelector value={language} onChange={setLanguage} />
                    </div>
                    <div className="flex-grow mb-4">
                      <CodeEditor value={code} onChange={setCode} />
                    </div>

                    {codeError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription className="whitespace-pre-wrap break-words">
                          {codeError}
                          {(codeError.includes("AI") || codeError.includes("timed out") || codeError.includes("server")) && (
                            <div className="mt-2 text-xs">
                              This might be due to a temporary issue with the AI service. Please try again in a moment.
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      onClick={handleGenerateCodeClick} 
                      disabled={isGeneratingCode} 
                      className="w-full mt-2" 
                      size="lg" 
                      type="submit"
                    >
                    {isGeneratingCode ? (
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
                  </form>
                </div>
              ) : (
                <div className="flex flex-col flex-grow">
                  <form 
                    className="flex flex-col flex-grow" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleGenerateIdeasClick();
                    }}
                  >
                    <div className="mb-4">
                      <IdeasEditor value={ideas} onChange={setIdeas} />
                    </div>

                    {ideasError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription className="whitespace-pre-wrap break-words">
                          {ideasError}
                          {(ideasError.includes("AI") || ideasError.includes("timed out") || ideasError.includes("server")) && (
                            <div className="mt-2 text-xs">
                              This might be due to a temporary issue with the AI service. Please try again in a moment.
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      onClick={handleGenerateIdeasClick} 
                      disabled={isGeneratingIdeas} 
                      className="w-full mt-2" 
                      size="lg" 
                      type="submit"
                    >
                    {isGeneratingIdeas ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Sequence Diagram
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Diagram Output Section (65%) */}
        <div className="w-full lg:w-[65%]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {activeInputTab === "code" ? "Flowchart Output" : "Sequence Diagram Output"}
              </CardTitle>
              <CardDescription>
                {flowchartData 
                  ? activeInputTab === "code" 
                    ? "Visualized flowchart of your code" 
                    : "Visualized sequence diagram of your ideas"
                  : activeInputTab === "code"
                    ? "Click 'Generate Flowchart' to create a diagram"
                    : "Click 'Generate Sequence Diagram' to create a diagram"}
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
              {activeInputTab === "code" ? (
                <JsonFlowchart data={flowchartData} theme="dark" />
              ) : (
                <SequenceDiagram data={flowchartData} theme="dark" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diagram History Section (Below) */}
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Diagram History</h2>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === "code" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("code")}
            >
              Code History
            </Button>
            <Button 
              variant={activeTab === "ideas" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("ideas")}
            >
              Ideas History
            </Button>
          </div>
        </div>
        
        {activeTab === "code" ? (
          <JsonDiagramHistory
            history={codeHistory}
            onClearHistory={clearCodeHistory}
            onRemoveItem={removeCodeFromHistory}
            onRestoreItem={(item) => {
              restoreCodeFromHistory(item)
              setActiveInputTab("code")
            }}
          />
        ) : (
          <JsonDiagramHistory
            history={ideasHistory}
            onClearHistory={clearIdeasHistory}
            onRemoveItem={removeIdeasFromHistory}
            onRestoreItem={(item) => {
              restoreIdeasFromHistory(item)
              setActiveInputTab("ideas")
            }}
          />
        )}
      </div>
    </main>
  )
}
