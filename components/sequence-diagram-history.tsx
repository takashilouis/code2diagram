"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, History, Clock, Code, ArrowUpRight, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SequenceDiagram } from "@/components/sequence-diagram"

interface DiagramHistoryItem {
  id: string
  code: string
  language: string
  diagramType: string
  diagram: string
  timestamp: number
}

interface SequenceDiagramHistoryProps {
  history: DiagramHistoryItem[]
  onClearHistory: () => void
  onRemoveItem: (id: string) => void
  onRestoreItem: (item: DiagramHistoryItem) => void
}

export function SequenceDiagramHistory({
  history,
  onClearHistory,
  onRemoveItem,
  onRestoreItem,
}: SequenceDiagramHistoryProps) {
  
  const [selectedItem, setSelectedItem] = useState<DiagramHistoryItem | null>(null)

  const getCodePreview = (code: string) => {
    const lines = code.trim().split('\n')
    if (lines.length === 0) return "Empty code"
    
    const firstLine = lines[0].trim()
    if (firstLine.length > 50) {
      return firstLine.substring(0, 47) + "..."
    }
    return firstLine || "Empty first line"
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) {
      return "Just now"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getLanguageIcon = (language: string) => {
    switch (language.toLowerCase()) {
      case 'javascript':
        return 'JS'
      case 'typescript':
        return 'TS'
      case 'python':
        return 'PY'
      case 'java':
        return 'JV'
      case 'cpp':
      case 'c++':
        return 'C+'
      case 'c':
        return 'C'
      case 'go':
        return 'GO'
      case 'rust':
        return 'RS'
      case 'php':
        return 'PHP'
      case 'ruby':
        return 'RB'
      case 'swift':
        return 'SW'
      case 'kotlin':
        return 'KT'
      case 'csharp':
      case 'c#':
        return 'C#'
      default:
        return language.substring(0, 2).toUpperCase()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Sequence Diagram History
            </CardTitle>
            <CardDescription>
              {history.length} sequence diagram{history.length !== 1 ? 's' : ''} generated
            </CardDescription>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearHistory}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

      </CardHeader>
      <CardContent className="pb-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <History className="h-12 w-12 mb-2 opacity-20" />
            <p>No sequence diagram history yet</p>
            <p className="text-sm">Generated sequence diagrams will appear here</p>
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
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                          Sequence Diagram
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
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
              <DialogTitle>Previous Sequence Diagram</DialogTitle>
              <DialogDescription>
                Generated on {formatDate(selectedItem.timestamp)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 p-1 w-full">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-2">
                    <h3 className="text-sm font-medium mb-2">Ideas/Description</h3>
                    <pre className="text-xs p-2 bg-gray-100 dark:bg-gray-800 rounded w-full h-auto whitespace-pre-wrap">
                    <code>{selectedItem.code}</code>
                    </pre>
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
