"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, KeyRound, AlertTriangle, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function ApiKeyInfo() {
  const [showApiKeyInfo, setShowApiKeyInfo] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [isKeyConfigured, setIsKeyConfigured] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  // Check if API key is configured on component mount
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch("/api/check-api-key")
        const data = await response.json()
        setIsKeyConfigured(data.isConfigured)

        // If we're in development, we might be able to get a masked version of the key
        if (data.maskedKey) {
          setApiKey(data.maskedKey)
        }
      } catch (error) {
        console.error("Error checking API key:", error)
        setIsKeyConfigured(false)
      }
    }

    checkApiKey()
  }, [])

  const handleSaveApiKey = async () => {
    try {
      const response = await fetch("/api/update-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "API Key Updated",
          description: "Your Google API key has been updated successfully. You may need to restart the application.",
          duration: 5000,
        })
        setIsKeyConfigured(true)
        setIsEditing(false)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update API key",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Error updating API key:", error)
      toast({
        title: "Error",
        description: "Failed to update API key. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Google API Key Information
        </CardTitle>
        <CardDescription>Your Google API key is used for Gemini AI diagram generation</CardDescription>
      </CardHeader>
      <CardContent>
        {isKeyConfigured ? (
          <Alert className="bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>API Key Configured</AlertTitle>
            <AlertDescription>
              Your Google API key has been successfully configured and is being used for Gemini API requests.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>API Key Not Configured</AlertTitle>
            <AlertDescription>
              Your Google API key is missing or invalid. Please update it below to use the Gemini API for diagram
              generation.
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowApiKeyInfo(!showApiKeyInfo)
              setIsEditing(false)
            }}
            className="w-full"
          >
            {showApiKeyInfo ? "Hide API Key Info" : "Show API Key Info"}
          </Button>
        </div>

        {showApiKeyInfo && (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Environment Variable Name</p>
              <Input value="GOOGLE_API_KEY" readOnly />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">API Key</p>
              <div className="flex gap-2">
                <Input
                  type={isEditing ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Google API key"
                  readOnly={!isEditing}
                  className="flex-1"
                />
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </div>
            {isEditing && (
              <Button onClick={handleSaveApiKey} className="w-full flex items-center gap-1">
                <Save className="h-4 w-4" />
                Save API Key
              </Button>
            )}
            <div>
              <p className="text-sm font-medium mb-1">Status</p>
              <div
                className={`flex items-center gap-2 ${isKeyConfigured ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
              >
                {isKeyConfigured ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span>Inactive or Invalid</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">Your API key is stored securely and never shared</p>
      </CardFooter>
    </Card>
  )
}
