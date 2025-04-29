"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DiagramHistoryItem } from "@/lib/hooks/use-diagram-history"
import { Trash2, Clock, Code, ArrowUpRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DiagramHistoryProps {
  history: DiagramHistoryItem[]
  onClearHistory: () => void
  onRemoveItem: (id: string) => void
  onRestoreItem: (item: DiagramHistoryItem) => void
}

export function DiagramHistory({ history, onClearHistory, onRemoveItem, onRestoreItem }: DiagramHistoryProps) {
  const [selectedItem, setSelectedItem] = useState<DiagramHistoryItem | null>(null)

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Diagram History
          </CardTitle>
          <CardDescription>Your previously generated diagrams will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mb-4 opacity-20" />
            <p>No diagram history yet</p>
            <p className="text-sm mt-1">Generate a diagram to see it in your history</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Diagram History
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClearHistory} className="h-8 px-2 text-muted-foreground">
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
        <CardDescription>Your previously generated diagrams</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="p-3 flex justify-between items-center border-b">
                  <div>
                    <h4 className="text-sm font-medium">
                      {item.diagramType.charAt(0).toUpperCase() + item.diagramType.slice(1)}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.timestamp), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedItem(item)}>
                          <Code className="h-4 w-4" />
                          <span className="sr-only">View Code</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Diagram Details</DialogTitle>
                          <DialogDescription>
                            {selectedItem && format(new Date(selectedItem.timestamp), "MMMM d, yyyy h:mm a")}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedItem && (
                          <Tabs defaultValue="code">
                            <TabsList>
                              <TabsTrigger value="code">Source Code</TabsTrigger>
                              <TabsTrigger value="diagram">Diagram Code</TabsTrigger>
                            </TabsList>
                            <TabsContent value="code">
                              <div className="bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
                                <pre className="text-xs font-mono">{selectedItem.code}</pre>
                              </div>
                            </TabsContent>
                            <TabsContent value="diagram">
                              <div className="bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
                                <pre className="text-xs font-mono">{selectedItem.diagram}</pre>
                              </div>
                            </TabsContent>
                          </Tabs>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onRestoreItem(item)}>
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="sr-only">Restore</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-muted/30">
                  <div className="text-xs font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.diagram.split("\n")[0]}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
