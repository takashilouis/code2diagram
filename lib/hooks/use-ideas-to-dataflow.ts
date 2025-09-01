"use client"

import { useState } from "react"
import { useDiagramHistory, type DiagramHistoryItem } from "@/lib/hooks/use-diagram-history"

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

interface UseIdeasToSequenceProps {
  initialIdeas?: string
}

interface UseIdeasToSequenceReturn {
  ideas: string
  setIdeas: (ideas: string) => void
  flowchartData: FlowData | null
  isGenerating: boolean
  error: string | null
  warning: string | null
  generateSequence: () => Promise<void>
  diagramHistory: DiagramHistoryItem[]
  clearHistory: () => void
  removeFromHistory: (id: string) => void
  restoreFromHistory: (item: DiagramHistoryItem) => void
}

export function useIdeasToSequence({
  initialIdeas = "",
}: UseIdeasToSequenceProps = {}): UseIdeasToSequenceReturn {
  const [ideas, setIdeas] = useState<string>(initialIdeas || getDefaultIdeas())
  const [flowchartData, setFlowchartData] = useState<FlowData | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const { history, addToHistory, clearHistory, removeFromHistory } = useDiagramHistory(20)

  const generateSequence = async () => {
    // If ideas is empty, use default ideas
    const ideasToUse = ideas.trim() || getDefaultIdeas()

    setIsGenerating(true)
    setError(null)
    setWarning(null)
    setFlowchartData(null) // Reset flowchart data before generating a new one

    try {
      console.log("Generating sequence diagram for ideas:", ideasToUse.substring(0, 50) + "...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      try {
        const response = await fetch("/api/generate-sequence", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ideas: ideasToUse }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Check if the response is JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          console.error("Non-JSON response:", text)
          throw new Error("Server returned a non-JSON response. Please try again later.")
        }

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `Server error: ${response.status}`)
        }

        if (!data.flowchartData) {
          throw new Error("No flowchart data was generated. Please try again.")
        }

        setFlowchartData(data.flowchartData)

        // Add to history
        addToHistory({
          code: ideasToUse,
          language: "text",
          diagramType: "dataflow",
          diagram: JSON.stringify(data.flowchartData),
        })

        // Set warning if present
        if (data.warning) {
          setWarning(data.warning)
        }
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          throw new Error("Request timed out. Please try again.")
        }
        throw fetchError
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      console.error("Error generating dataflow:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const restoreFromHistory = (item: DiagramHistoryItem) => {
    setIdeas(item.code)
    
    try {
      // Parse the diagram string back to JSON
      if (item.diagram) {
        setFlowchartData(JSON.parse(item.diagram))
      }
    } catch (err) {
      console.error("Error parsing diagram from history:", err)
    }
    
    setError(null)
    setWarning(null)
  }

  return {
    ideas,
    setIdeas,
    flowchartData,
    isGenerating,
    error,
    warning,
    generateSequence,
    diagramHistory: history,
    clearHistory,
    removeFromHistory,
    restoreFromHistory,
  }
}

function getDefaultIdeas() {
  return `Create a system that collects user data from a web application, processes it through an analytics engine, stores the results in a database, and then displays insights on a dashboard. The system should also allow for data export to external systems.`
}
