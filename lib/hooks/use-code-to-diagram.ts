"use client"

import { useState } from "react"
import { useDiagramHistory, type DiagramHistoryItem } from "@/lib/hooks/use-diagram-history"

interface UseCodeToDiagramProps {
  initialCode?: string
  initialLanguage?: string
  initialDiagramType?: string
}

interface UseCodeToDiagramReturn {
  code: string
  setCode: (code: string) => void
  language: string
  setLanguage: (language: string) => void
  diagramType: string
  setDiagramType: (type: string) => void
  diagram: string | null
  isGenerating: boolean
  error: string | null
  warning: string | null
  generateDiagram: () => Promise<void>
  diagramHistory: DiagramHistoryItem[]
  clearHistory: () => void
  removeFromHistory: (id: string) => void
  restoreFromHistory: (item: DiagramHistoryItem) => void
}

export function useCodeToDiagram({
  initialCode = "",
  initialLanguage = "javascript",
  initialDiagramType = "flowchart",
}: UseCodeToDiagramProps = {}): UseCodeToDiagramReturn {
  const [code, setCode] = useState<string>(initialCode || getDefaultCode())
  const [language, setLanguage] = useState<string>(initialLanguage)
  const [diagramType, setDiagramType] = useState<string>(initialDiagramType)
  const [diagram, setDiagram] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const { history, addToHistory, clearHistory, removeFromHistory } = useDiagramHistory(20)

  const generateDiagram = async () => {
    // If code is empty, use default code
    const codeToUse = code.trim() || getDefaultCode()

    setIsGenerating(true)
    setError(null)
    setWarning(null)
    setDiagram(null) // Reset diagram before generating a new one

    try {
      console.log("Generating diagram for code:", codeToUse.substring(0, 50) + "...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      try {
        const response = await fetch("/api/generate-diagram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: codeToUse, language, diagramType }),
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

        if (!data.diagram) {
          throw new Error("No diagram was generated. Please try again.")
        }

        setDiagram(data.diagram)

        // Add to history
        addToHistory({
          code: codeToUse,
          language,
          diagramType,
          diagram: data.diagram,
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
      console.error("Error generating diagram:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const restoreFromHistory = (item: DiagramHistoryItem) => {
    setCode(item.code)
    setLanguage(item.language)
    setDiagramType(item.diagramType)
    setDiagram(item.diagram)
    setError(null)
    setWarning(null)
  }

  return {
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
    diagramHistory: history,
    clearHistory,
    removeFromHistory,
    restoreFromHistory,
  }
}

function getDefaultCode() {
  return `function calculateFactorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  
  return n * calculateFactorial(n - 1);
}

function main() {
  const number = 5;
  const result = calculateFactorial(number);
  console.log(\`The factorial of \${number} is \${result}\`);
}

main();`
}
