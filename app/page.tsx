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
import { Loader2, ArrowRight, AlertTriangle, AlertCircle, FileText, Code, Download, Image as ImageIcon, FileCode } from "lucide-react"
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

  const handleDownloadMermaid = () => {
    if (flowchartData) {
      // Convert flowchart data to Mermaid format
      const mermaidContent = generateMermaidDiagram(flowchartData, activeInputTab)
      const mermaidBlob = new Blob([mermaidContent], { type: "text/plain;charset=utf-8" })
      const mermaidUrl = URL.createObjectURL(mermaidBlob)
      const downloadLink = document.createElement("a")
      downloadLink.href = mermaidUrl
      downloadLink.download = `${activeInputTab === "code" ? "flowchart" : "sequence-diagram"}.md`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(mermaidUrl)
    }
  }

  // Generate Mermaid diagram format
  const generateMermaidDiagram = (data: any, diagramType: string) => {
    if (diagramType === "code") {
      // Flowchart Mermaid format
      let mermaidContent = "```mermaid\nflowchart TD\n"
      
      // Add nodes with proper Mermaid syntax
      data.nodes.forEach((node: any) => {
        const label = node.data.label.replace(/"/g, '&quot;')
        if (node.type === 'start' || node.type === 'end') {
          mermaidContent += `    ${node.id}([${label}])\n`
        } else if (node.type === 'decision') {
          mermaidContent += `    ${node.id}{${label}}\n`
        } else if (node.type === 'process') {
          mermaidContent += `    ${node.id}[${label}]\n`
        } else {
          mermaidContent += `    ${node.id}[${label}]\n`
        }
      })
      
      mermaidContent += "\n"
      
      // Add edges
      data.edges.forEach((edge: any) => {
        const label = edge.label ? `|${edge.label}|` : ""
        mermaidContent += `    ${edge.source} -->${label} ${edge.target}\n`
      })
      
      mermaidContent += "```"
      return mermaidContent
    } else {
      // Sequence diagram Mermaid format
      let mermaidContent = "```mermaid\nsequenceDiagram\n"
      
      // Add participants
      data.nodes.forEach((node: any) => {
        mermaidContent += `    participant ${node.id} as ${node.data.label}\n`
      })
      
      mermaidContent += "\n"
      
      // Add messages
      data.edges.forEach((edge: any) => {
        const label = edge.label || "message"
        mermaidContent += `    ${edge.source}->>${edge.target}: ${label}\n`
      })
      
      mermaidContent += "```"
      return mermaidContent
    }
  }

  const handleDownloadPNG = () => {
    const svgElement = document.querySelector('.json-flowchart svg, .sequence-diagram svg')
    if (svgElement) {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        console.error("Could not get canvas context")
        return
      }
      
      // Get SVG dimensions and scale for higher quality
      const svgRect = svgElement.getBoundingClientRect()
      const scale = 2 // 2x resolution for higher quality
      canvas.width = (svgRect.width || 800) * scale
      canvas.height = (svgRect.height || 600) * scale
      
      // Scale the context for high DPI
      ctx.scale(scale, scale)
      
      // Create a copy of SVG and ensure all text is white for PNG export
      const svgClone = svgElement.cloneNode(true) as SVGElement
      
      // Fix sequence diagram colors intelligently
      const fixSequenceDiagramColors = (element: Element) => {
        // Force ALL text to be white with better visibility
        if (element.tagName === 'text') {
          element.setAttribute('fill', '#ffffff')
          element.setAttribute('stroke', 'none')
          // Make sure text is bold and visible
          element.setAttribute('font-weight', 'bold')
          element.setAttribute('font-size', element.getAttribute('font-size') || '12px')
        }
        
        // Handle rectangles intelligently
        if (element.tagName === 'rect') {
          const width = parseFloat(element.getAttribute('width') || '0')
          const height = parseFloat(element.getAttribute('height') || '0')
          const currentFill = element.getAttribute('fill')
          
          // Large rectangles (background/container/alt boxes) - make them dark but semi-transparent
          if (width > 300 || height > 200) {
            // If it's an alt box (usually has light fill), make it dark with transparency
            if (currentFill && (currentFill.includes('rgba') || currentFill === '#f5f5f5' || currentFill.includes('245'))) {
              element.setAttribute('fill', 'rgba(45, 51, 59, 0.8)')  // Dark with transparency
            } else {
              element.setAttribute('fill', '#1a1a1a')
            }
            element.setAttribute('stroke', '#8b949e')
            element.setAttribute('stroke-width', '1.5')
          } 
          // Small rectangles (participant boxes) should be dark with good contrast
          else {
            element.setAttribute('fill', '#2D333B')
            element.setAttribute('stroke', '#8b949e')
            element.setAttribute('stroke-width', '1.5')
          }
        }
        
        // Force any remaining light colors to white text
        const currentFill = element.getAttribute('fill')
        if (currentFill && 
            element.tagName !== 'rect' && 
            (currentFill === '#333' || currentFill === '#000' || currentFill === 'black' || 
             (currentFill.startsWith('#') && parseInt(currentFill.slice(1), 16) < 0x808080))) {
          element.setAttribute('fill', '#ffffff')
        }
        
        // Recursively process children
        Array.from(element.children).forEach(fixSequenceDiagramColors)
      }
      
      fixSequenceDiagramColors(svgClone)
      
      // Fill with dark background to match the theme
      ctx.fillStyle = "#0d1117"
      ctx.fillRect(0, 0, svgRect.width || 800, svgRect.height || 600)
      
      // Convert modified SVG to image
      const svgData = new XMLSerializer().serializeToString(svgClone)
      const img = new window.Image()
      
      img.onload = () => {
        // Draw with high quality settings
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, svgRect.width || 800, svgRect.height || 600)
        const pngUrl = canvas.toDataURL("image/png", 1.0) // Maximum quality
        const downloadLink = document.createElement("a")
        downloadLink.href = pngUrl
        downloadLink.download = `${activeInputTab === "code" ? "flowchart" : "sequence-diagram"}.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
      }
      
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    }
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
              <div className="flex justify-between items-start">
                <div>
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
                </div>
                {flowchartData && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadMermaid}
                      className="flex items-center gap-1"
                    >
                      <FileCode className="h-4 w-4" />
                      Mermaid
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPNG}
                      className="flex items-center gap-1"
                    >
                      <ImageIcon className="h-4 w-4" />
                      PNG
                    </Button>
                  </div>
                )}
              </div>
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
