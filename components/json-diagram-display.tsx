"use client"

import { useEffect, useRef, useState } from "react"
import { FileCode2, Download, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JsonDiagramCustomization } from "@/components/json-diagram-customization"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JsonDiagramShare } from "@/components/json-diagram-share"
import { JsonFlowchart } from "@/components/json-flowchart"

interface FlowNode {
  id: string
  type: string
  data: {
    label: string
  }
}

interface FlowEdge {
  id: string
  source: string
  target: string
  label?: string
}

interface FlowData {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

interface JsonDiagramDisplayProps {
  flowchartData: FlowData | null
}

export function JsonDiagramDisplay({ flowchartData }: JsonDiagramDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canDownload, setCanDownload] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [activeTab, setActiveTab] = useState<string>("diagram")
  const [diagramId, setDiagramId] = useState(`flowchart-${Math.random().toString(36).substring(2, 9)}`)

  useEffect(() => {
    // Debug the flowchart data
    console.log("JsonDiagramDisplay received data:", {
      dataExists: !!flowchartData,
      nodeCount: flowchartData?.nodes.length || 0,
      edgeCount: flowchartData?.edges.length || 0
    })
  }, [flowchartData])

  // Function to download the diagram as an SVG
  const handleDownloadSVG = () => {
    if (!containerRef.current) return

    try {
      const svgElement = containerRef.current.querySelector(".json-flowchart svg")
      if (!svgElement) {
        console.error("No SVG element found")
        return
      }

      // Clone the SVG to avoid modifying the displayed one
      const svgClone = svgElement.cloneNode(true) as SVGElement

      // Set explicit dimensions
      svgClone.setAttribute("width", svgElement.clientWidth.toString())
      svgClone.setAttribute("height", svgElement.clientHeight.toString())
      
      // Make sure the background is included
      svgClone.setAttribute("style", "background-color: #0d1117; border-radius: 8px;")

      // Convert SVG to string
      const svgData = new XMLSerializer().serializeToString(svgClone)
      
      // Add XML declaration and doctype
      const svgDoctype = '<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'
      const svgWithDoctype = svgDoctype + svgData
      
      const svgBlob = new Blob([svgWithDoctype], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Create download link
      const downloadLink = document.createElement("a")
      downloadLink.href = svgUrl
      downloadLink.download = "flowchart.svg"
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      // Clean up
      URL.revokeObjectURL(svgUrl)
      console.log("SVG downloaded successfully")
    } catch (error) {
      console.error("Error downloading SVG:", error)
      alert("Error downloading SVG: " + (error instanceof Error ? error.message : String(error)))
    }
  }

  // Function to download the diagram as a PNG
  const handleDownloadPNG = () => {
    if (!containerRef.current) return

    try {
      const svgElement = containerRef.current.querySelector(".json-flowchart svg")
      if (!svgElement) {
        console.error("No SVG element found")
        return
      }

      // Clone the SVG to avoid modifying the displayed one
      const svgClone = svgElement.cloneNode(true) as SVGElement
      
      // Get the dimensions of the actual graph content
      const gElement = svgClone.querySelector("g") as SVGGElement
      if (!gElement) {
        console.error("No graph element found")
        return
      }
      
      // Get the transform attribute to understand the current positioning
      const transform = gElement.getAttribute("transform")
      const bbox = gElement.getBBox()
      
      // Calculate the actual content dimensions with some padding
      const padding = 40
      const contentWidth = bbox.width + (padding * 2)
      const contentHeight = bbox.height + (padding * 2)
      
      // Set the SVG dimensions to match the content
      svgClone.setAttribute("width", contentWidth.toString())
      svgClone.setAttribute("height", contentHeight.toString())
      
      // Reset the transform to center the content
      gElement.setAttribute("transform", `translate(${padding}, ${padding})`)
      
      // Ensure the background is included
      svgClone.setAttribute("style", "background-color: #0d1117;")
      
      // Make sure all text is white
      const textElements = svgClone.querySelectorAll("text")
      textElements.forEach(text => {
        text.setAttribute("fill", "#ffffff")
      })
      
      // Create a canvas with a 2x scale for better quality
      const canvas = document.createElement("canvas")
      const scale = 2
      canvas.width = contentWidth * scale
      canvas.height = contentHeight * scale
      const ctx = canvas.getContext("2d")
      
      if (!ctx) {
        console.error("Could not get canvas context")
        return
      }
      
      // Set background color
      ctx.fillStyle = "#0d1117" // Always use dark background for PNG export
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Scale the context for higher resolution
      ctx.scale(scale, scale)
      
      // Get SVG data
      const svgData = new XMLSerializer().serializeToString(svgClone)
      
      // Create a Blob from the SVG data
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)
      
      // Create an image from the SVG
      const img = new Image()
      
      // Set up the onload handler before setting src
      img.onload = () => {
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, contentWidth, contentHeight)
        
        // Convert canvas to PNG and trigger download
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error("Could not create PNG blob")
            return
          }
          
          // Create download link
          const pngUrl = URL.createObjectURL(blob)
          const downloadLink = document.createElement("a")
          downloadLink.href = pngUrl
          downloadLink.download = "flowchart.png"
          document.body.appendChild(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
          
          // Clean up
          URL.revokeObjectURL(pngUrl)
          console.log("PNG downloaded successfully")
        }, "image/png", 1.0) // Use maximum quality
        
        // Clean up
        URL.revokeObjectURL(svgUrl)
      }
      
      // Handle errors
      img.onerror = (e) => {
        console.error("Error loading SVG into Image:", e)
        alert("Error creating PNG: Could not load the SVG image")
        URL.revokeObjectURL(svgUrl)
      }
      
      // Set the source to trigger loading
      img.src = svgUrl
    } catch (error) {
      console.error("Error downloading PNG:", error)
      alert("Error downloading PNG: " + (error instanceof Error ? error.message : String(error)))
    }
  }

  // Function to copy the diagram as JSON
  const handleCopyJSON = () => {
    if (!flowchartData) return

    try {
      const jsonString = JSON.stringify(flowchartData, null, 2)
      navigator.clipboard.writeText(jsonString)
      alert("Flowchart JSON copied to clipboard")
    } catch (error) {
      console.error("Error copying JSON:", error)
    }
  }

  return (
    <div ref={containerRef}>
      <Tabs defaultValue="diagram" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="diagram">Diagram</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadSVG} disabled={!flowchartData}>
              <FileCode2 className="h-4 w-4 mr-2" />
              SVG
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPNG} disabled={!flowchartData}>
              <ImageIcon className="h-4 w-4 mr-2" />
              PNG
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyJSON} disabled={!flowchartData}>
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>

        <TabsContent value="diagram" className="mt-0">
          <div className="relative">
            <div className="overflow-auto h-[400px] bg-white dark:bg-gray-900 p-4 rounded-md border">
              {flowchartData ? (
                <JsonFlowchart data={flowchartData} theme={theme} />
              ) : (
                <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p className="text-gray-500 dark:text-gray-400">No flowchart data available. Click "Generate Diagram" to create one.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customize" className="mt-0">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-md border">
            <JsonDiagramCustomization
              theme={theme}
              setTheme={setTheme}
            />
          </div>
        </TabsContent>

        <TabsContent value="share" className="mt-0">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-md border">
            <JsonDiagramShare diagramId={diagramId} flowchartData={flowchartData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
