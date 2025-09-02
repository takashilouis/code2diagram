"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, History, Clock, Code, ArrowUpRight, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { JsonFlowchart } from "@/components/json-flowchart"

interface DiagramHistoryItem {
  id: string
  code: string
  language: string
  diagramType: string
  diagram: string
  timestamp: number
}

interface CodeDiagramHistoryProps {
  history: DiagramHistoryItem[]
  onClearHistory: () => void
  onRemoveItem: (id: string) => void
  onRestoreItem: (item: DiagramHistoryItem) => void
}

export function CodeDiagramHistory({
  history,
  onClearHistory,
  onRemoveItem,
  onRestoreItem,
}: CodeDiagramHistoryProps) {
  const [selectedItem, setSelectedItem] = useState<DiagramHistoryItem | null>(null)

  // Format the timestamp to a readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Get a preview of the code (first 50 characters)
  const getCodePreview = (code: string) => {
    if (!code) return "No code"
    const lines = code.split("\n")
    const firstLine = lines[0].trim()
    
    // Get function name or first meaningful line
    if (firstLine.includes("function")) {
      const functionName = firstLine.match(/function\s+([a-zA-Z0-9_]+)/)
      return functionName ? `Function: ${functionName[1]}()` : firstLine.substring(0, 30)
    }
    
    // For classes
    if (firstLine.includes("class")) {
      const className = firstLine.match(/class\s+([a-zA-Z0-9_]+)/)
      return className ? `Class: ${className[1]}` : firstLine.substring(0, 30)
    }
    
    // Get first non-empty line that's not a comment or import
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith("//") && !trimmedLine.startsWith("import") && !trimmedLine.startsWith("/*")) {
        return trimmedLine.substring(0, 30) + (trimmedLine.length > 30 ? "..." : "")
      }
    }
    
    return firstLine.substring(0, 30) + (firstLine.length > 30 ? "..." : "")
  }

  // Count the number of functions in the code
  const countFunctions = (code: string) => {
    if (!code) return 0
    const matches = code.match(/function\s+[a-zA-Z0-9_]+/g)
    return matches ? matches.length : 0
  }

  // Count the number of loops in the code
  const countLoops = (code: string) => {
    if (!code) return 0
    const forLoops = (code.match(/for\s*\(/g) || []).length
    const whileLoops = (code.match(/while\s*\(/g) || []).length
    return forLoops + whileLoops
  }

  // Count the number of conditionals in the code
  const countConditionals = (code: string) => {
    if (!code) return 0
    const ifStatements = (code.match(/if\s*\(/g) || []).length
    const elseStatements = (code.match(/else[\s{]/g) || []).length
    return ifStatements + elseStatements
  }

  // Get the language icon
  const getLanguageIcon = (language: string) => {
    switch (language.toLowerCase()) {
      case "javascript":
        return "JS"
      case "typescript":
        return "TS"
      case "python":
        return "PY"
      case "java":
        return "JV"
      case "c":
        return "C"
      case "cpp":
      case "c++":
        return "C++"
      default:
        return language.substring(0, 2).toUpperCase()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <History className="mr-2 h-5 w-5" />
            Code Flowchart History
          </CardTitle>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearHistory}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <CardDescription>Your previously generated code flowcharts</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <History className="h-12 w-12 mb-2 opacity-20" />
            <p>No flowchart history yet</p>
            <p className="text-sm">Generated code flowcharts will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {history.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="p-3 flex justify-between items-start">
                    <div className="flex-1 mr-2">
                      <div className="flex items-center mb-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary mr-2">
                          {getLanguageIcon(item.language)}
                        </div>
                        <h4 className="text-sm font-semibold">{getCodePreview(item.code)}</h4>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                      <div className="flex mt-2 space-x-2">
                        <div className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {countFunctions(item.code)} functions
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                          {countLoops(item.code)} loops
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                          {countConditionals(item.code)} conditionals
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onRestoreItem(item)}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Dialog to show the selected item details */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Previous Code Flowchart</DialogTitle>
              <DialogDescription>
                Generated on {formatDate(selectedItem.timestamp)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto p-1">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 overflow-auto">
                <h3 className="text-sm font-medium mb-2">Code</h3>
                <pre className="text-xs overflow-auto p-2 bg-gray-100 dark:bg-gray-800 rounded max-h-[300px]">
                  <code>{selectedItem.code}</code>
                </pre>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 overflow-auto">
                <h3 className="text-sm font-medium mb-2">Code Flowchart</h3>
                <div className="overflow-auto max-h-[300px]">
                  {selectedItem.diagram && (
                    <JsonFlowchart data={JSON.parse(selectedItem.diagram)} theme="dark" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setSelectedItem(null)} className="mr-2">
                Close
              </Button>
              <Button onClick={() => {
                onRestoreItem(selectedItem)
                setSelectedItem(null)
              }}>
                Restore This Diagram
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
