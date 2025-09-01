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

interface DiagramShareProps {
  diagram: string | null
  diagramType: string
}

export function DiagramShare({ diagram, diagramType }: DiagramShareProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string>("")

  // Generate a shareable URL when the dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open && diagram) {
      // In a real app, this would create a shareable link by saving the diagram to a database
      // For now, we'll just simulate it with a fake URL
      const fakeId = Math.random().toString(36).substring(2, 10)
      setShareUrl(`https://codexflow.vercel.app/share/${fakeId}`)
    }
    setOpen(open)
  }

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  // Generate embed code for the diagram
  const getEmbedCode = () => {
    if (!diagram) return ""

    return `<div class="mermaid">
${diagram}
</div>
<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
<script>mermaid.initialize({startOnLoad:true});</script>`
  }

  if (!diagram) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Diagram</DialogTitle>
          <DialogDescription>
            Share your {diagramType} diagram with others or embed it in your website
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="share-link">Shareable Link</Label>
                <div className="flex items-center space-x-2">
                  <Input id="share-link" value={shareUrl} readOnly className="flex-1" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(shareUrl, "link")}
                    className="flex-shrink-0"
                  >
                    {copied === "link" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Anyone with this link will be able to view this diagram</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="embed-code">Embed Code</Label>
                <div className="relative">
                  <Textarea id="embed-code" value={getEmbedCode()} readOnly rows={6} className="font-mono text-xs" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(getEmbedCode(), "embed")}
                    className="absolute top-2 right-2"
                  >
                    {copied === "embed" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Copy and paste this code to embed the diagram in your website
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Share your diagram on social media</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
