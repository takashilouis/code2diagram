"use client"

import { useEffect, useRef, useState } from "react"
import { FileCode2, Download, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DiagramCustomization } from "@/components/diagram-customization"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DiagramShare } from "@/components/diagram-share"
import { D3Flowchart } from "@/components/d3-flowchart-fixed"

interface DiagramDisplayProps {
  diagram: string | null
  diagramType?: string
}

export function DiagramDisplay({ diagram, diagramType = "flowchart" }: DiagramDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canDownload, setCanDownload] = useState(false)
  const [theme, setTheme] = useState("default")
  const [fontSize, setFontSize] = useState(14)
  const [direction, setDirection] = useState("TD")
  const [showGrid, setShowGrid] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("diagram")
  // Use a stable ID with useId hook or a fixed string
  const [diagramId, setDiagramId] = useState(`mermaid-diagram`)
  
  // Debug the diagram data
  useEffect(() => {
    console.log("DiagramDisplay received diagram:", {
      diagramExists: !!diagram,
      diagramLength: diagram?.length || 0,
      diagramType,
      diagramPreview: diagram?.substring(0, 50)
    })
  }, [diagram, diagramType])

  useEffect(() => {
    // We don't need to regenerate the ID anymore
    // This avoids hydration errors
  }, [diagram])

  // Function to sanitize and fix common Mermaid syntax issues
  const sanitizeMermaidDiagram = (diagramText: string, type: string, flowDirection: string): string => {
    console.log("Sanitizing diagram with type:", type, "and direction:", flowDirection);
    // Determine the diagram type prefix
    let typePrefix = ""
    if (type === "sequence") {
      typePrefix = "sequenceDiagram"
    } else if (type === "class") {
      typePrefix = "classDiagram"
    } else {
      // For flowchart, include the direction
      typePrefix = `graph ${flowDirection}`
    }

    // Ensure the diagram starts with the correct prefix on its own line
    let sanitized = diagramText.trim()

    // Replace the existing diagram type declaration if it exists
    if (type === "flowchart" && sanitized.startsWith("graph ")) {
      // Replace the graph direction
      sanitized = `graph ${flowDirection}` + sanitized.substring(sanitized.indexOf("\n"))
    } else if (!sanitized.startsWith(typePrefix)) {
      sanitized = typePrefix + "\n" + sanitized
    } else if (!sanitized.startsWith(typePrefix + "\n")) {
      sanitized = typePrefix + "\n" + sanitized.substring(typePrefix.length).trim()
    }

    // Fix lines based on diagram type
    const lines = sanitized.split("\n")
    const fixedLines = lines.map((line, index) => {
      // Skip the type prefix line
      if (line.trim() === typePrefix) return line

      // Add proper indentation to other lines
      return line.startsWith("  ") ? line : `  ${line}`
    })

    return fixedLines.join("\n")
  }

  // Create a very simple fallback diagram based on type
  const createFallbackDiagram = (type: string, flowDirection: string): string => {
    if (type === "sequence") {
      return `sequenceDiagram
  participant A as System
  participant B as Function
  A->>B: Call
  B-->>A: Return`
    } else if (type === "class") {
      return `classDiagram
  class Main {
    +execute()
  }
  class Helper {
    +process()
  }
  Main --> Helper`
    } else {
      return `graph ${flowDirection}
  A[Start] --> B[Process]
  B --> C[End]`
    }
  }

  useEffect(() => {
    // D3 flowchart is now used instead of mermaid
    // No initialization needed here
  }, [])
  
  // Add effect to handle diagram data
  useEffect(() => {
    if (diagram) {
      console.log('DiagramDisplay: Received diagram', { diagramType, diagramLength: diagram.length });
      console.log('DiagramDisplay: First 100 chars:', diagram.substring(0, 100));
      setCanDownload(true);
    } else {
      console.log('DiagramDisplay: No diagram data');
      setCanDownload(false);
    }
  }, [diagram, diagramType])

  const handleDownloadSVG = () => {
    // Get the SVG from the D3Flowchart component
    const svgElement = document.querySelector('.d3-flowchart svg')
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)
      const downloadLink = document.createElement("a")
      downloadLink.href = svgUrl
      downloadLink.download = "diagram.svg"
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const handleDownloadPNG = () => {
    // Get the SVG from the D3Flowchart component
    const svgElement = document.querySelector('.d3-flowchart svg')
    if (svgElement) {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        console.error("Could not get canvas context")
        return
      }
      
      // Get SVG dimensions
      let width = svgElement.getAttribute("width") || "800"
      let height = svgElement.getAttribute("height") || "600"
      
      // Try to get bbox if available
      try {
        const bbox = (svgElement as SVGSVGElement).getBBox()
        width = svgElement.getAttribute("width") || `${bbox.width + 20}`
        height = svgElement.getAttribute("height") || `${bbox.height + 20}`
      } catch (e) {
        console.error("Error getting SVG dimensions:", e)
      }
      
      // Set canvas dimensions
      canvas.width = Number.parseInt(width)
      canvas.height = Number.parseInt(height)
      
      // Convert SVG to a data URL
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const img = new Image()

      // Fill with white background
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw the image
      img.onload = () => {
        ctx.drawImage(img, 0, 0)

        // Convert to PNG data URL
        const pngUrl = canvas.toDataURL("image/png")

        // Create a link to download the PNG
        const downloadLink = document.createElement("a")
        downloadLink.href = pngUrl
        downloadLink.download = "diagram.png"
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
      }

      // Load the SVG image
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    }
  }

  // Show placeholder when no diagram is available
  if (!diagram) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-md border border-dashed">
        <FileCode2 className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-center">No diagram generated yet.</p>
        <p className="text-center text-sm mt-2">Click "Generate Diagram" to create a diagram from your code.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
          <TabsList>
            <TabsTrigger value="diagram">Diagram</TabsTrigger>
            <TabsTrigger value="code">Mermaid Code</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <DiagramCustomization
            onThemeChange={setTheme}
            onFontSizeChange={setFontSize}
            onDirectionChange={setDirection}
            onShowGrid={setShowGrid}
          />
          {canDownload && (
            <>
              <DiagramShare diagram={diagram} diagramType={diagramType} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSVG}
                disabled={!canDownload}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPNG}
                disabled={!canDownload}
                className="flex items-center gap-1"
              >
                <ImageIcon className="h-4 w-4" />
                PNG
              </Button>
            </>
          )}
        </div>
      </div>

      <TabsContent value="diagram" className="mt-0">
        <div className="relative">
          <div className="overflow-auto h-[400px] bg-white dark:bg-gray-900 p-4 rounded-md border">
            {/* D3-based flowchart renderer */}
            {diagram ? (
              <D3Flowchart diagram={diagram} diagramType={diagramType} />
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-md">
                <p className="text-gray-500 dark:text-gray-400">No diagram data available. Click "Generate Diagram" to create one.</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="code" className="mt-0">
        <div className="overflow-auto h-[400px] bg-muted p-4 rounded-md border font-mono text-sm">{diagram}</div>
      </TabsContent>
    </div>
  )
}
