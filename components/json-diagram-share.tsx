"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, Copy, Check, Twitter, Facebook, Linkedin } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface JsonDiagramShareProps {
  diagramId: string
  flowchartData?: any
}

export function JsonDiagramShare({ diagramId, flowchartData }: JsonDiagramShareProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("link")

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/shared/${diagramId}`

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyJson = () => {
    if (!flowchartData) return
    
    const jsonString = JSON.stringify(flowchartData, null, 2)
    handleCopy(jsonString)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Share Your Flowchart</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Flowchart</DialogTitle>
              <DialogDescription>
                Share your flowchart with others or embed it in your website.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="link" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="link">Link</TabsTrigger>
                <TabsTrigger value="embed">Embed</TabsTrigger>
              </TabsList>
              <TabsContent value="link" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="share-link">Share Link</Label>
                  <div className="flex space-x-2">
                    <Input id="share-link" value={shareUrl} readOnly />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(shareUrl)}
                      className="flex-shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="embed" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="embed-code">Embed Code</Label>
                  <Textarea
                    id="embed-code"
                    readOnly
                    value={`<iframe src="${shareUrl}" width="100%" height="500" frameborder="0"></iframe>`}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleCopy(
                        `<iframe src="${shareUrl}" width="100%" height="500" frameborder="0"></iframe>`
                      )
                    }
                    className="w-full"
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy Embed Code
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        <Label>JSON Data</Label>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleCopyJson}
            className="w-full"
            disabled={!flowchartData}
          >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            Copy Flowchart JSON
          </Button>
        </div>
      </div>
    </div>
  )
}
