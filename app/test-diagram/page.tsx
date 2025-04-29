"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { D3Flowchart } from "@/components/d3-flowchart"
import { CodeEditor } from "@/components/code-editor"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"

export default function TestDiagramPage() {
  const [activeTab, setActiveTab] = useState("code")
  const [code, setCode] = useState("") 
  const [diagram, setDiagram] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sample code for the Coin Change algorithm
  const sampleCode = `function coinChange(coins, amount) {
    // Initialize dp array with amount + 1 (which is greater than any possible result)
    const dp = new Array(amount + 1).fill(amount + 1);
    
    // Base case: 0 coins needed to make amount 0
    dp[0] = 0;
    
    // Iterate through all amounts from 1 to target amount
    for (let currentAmount = 1; currentAmount <= amount; currentAmount++) {
        // Try each coin denomination
        for (let coin of coins) {
            // If this coin can contribute to the current amount
            if (coin <= currentAmount) {
                // Update with minimum: either current value or 1 + dp[currentAmount - coin]
                dp[currentAmount] = Math.min(
                    dp[currentAmount],
                    1 + dp[currentAmount - coin]
                );
            }
        }
    }
    
    // If dp[amount] is still amount + 1, it means no solution was found
    return dp[amount] > amount ? -1 : dp[amount];
}

// Example usage
function runExample() {
    const testCases = [
        { coins: [1, 2, 5], amount: 11 },
        { coins: [2], amount: 3 },
        { coins: [1], amount: 0 }
    ];
    
    for (const test of testCases) {
        const result = coinChange(test.coins, test.amount);
        console.log('Coins: [' + test.coins + '], Amount: ' + test.amount + ', Result: ' + result);
    }
}

// Run the examples
runExample();`

  // Initialize code with the sample
  useEffect(() => {
    setCode(sampleCode)
  }, [])

  // Initial diagram
  const initialDiagram = `graph TD
    A[Start] --> B{n <= 1?}
    B -->|Yes| C[Return 1]
    B -->|No| D[Compute n * factorial(n-1)]
    D --> E[Return result]
    C --> F[End]
    E --> F
  `

  // Function to generate diagram from code
  const generateDiagram = async () => {
    if (!code) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/generate-diagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: 'javascript',
          diagramType: 'flowchart',
        }),
      })
      
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
        setDiagram(initialDiagram) // Fallback to initial diagram
      } else {
        setDiagram(data.diagram)
        // Switch to diagram tab after generation
        setActiveTab('diagram')
      }
    } catch (err) {
      setError('Failed to generate diagram. Please try again.')
      console.error('Error generating diagram:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Diagram Tester</CardTitle>
          <CardDescription>
            Edit the code and generate a flowchart diagram using D3.js and dagre-d3.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">Code Editor</TabsTrigger>
              <TabsTrigger value="diagram">Diagram</TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="p-4">
              <div className="space-y-4">
                <CodeEditor value={code} onChange={setCode} />
                
                <Button 
                  onClick={generateDiagram} 
                  disabled={isGenerating} 
                  className="w-full" 
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate Diagram
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                
                {error && (
                  <div className="text-red-500 p-2 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded">
                    {error}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="diagram" className="p-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-md border overflow-auto h-[600px]">
                <D3Flowchart diagram={diagram || initialDiagram} diagramType="flowchart" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
