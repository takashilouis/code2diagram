import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Set a timeout for the AI request
const AI_REQUEST_TIMEOUT = 30000 // 30 seconds

export async function POST(req: NextRequest) {
  console.log("JSON Flowchart API route called - Starting flowchart generation process")

  try {
    // Parse the request body
    let code, language
    try {
      const body = await req.json()
      code = body.code
      language = body.language || "javascript"
      console.log("Received code length:", code?.length || 0)
      console.log("Language:", language)
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body. Please provide valid JSON." }, { status: 400 })
    }

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    // Limit code length to prevent issues
    const maxCodeLength = 5000
    if (code.length > maxCodeLength) {
      code = code.substring(0, maxCodeLength) + "\n// Code truncated due to length..."
      console.log("Code truncated to", maxCodeLength, "characters")
    }

    // Use the Google Generative AI SDK directly
    try {
      console.log("Attempting to generate JSON flowchart with Gemini")

      // Get API key from environment variable
      const apiKey = process.env.GOOGLE_API_KEY
      console.log("API Key exists:", !!apiKey)
      if (!apiKey) {
        throw new Error("GOOGLE_API_KEY environment variable is not set")
      }

      // Initialize the Gemini API
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

      const prompt = `
Analyze the following code and create a flowchart description in JSON format.
Return an object with 'nodes' and 'edges' arrays that describe the algorithm's flow.

For nodes, include:
- id: unique string 
- type: "start", "process", "decision", "io", or "end"
- data: { label: "Description of the step" }

For edges, include:
- id: unique string (e.g., "e1-2")
- source: ID of source node
- target: ID of target node
- label: (optional) condition or description

Example JSON:
{
  "nodes": [
    { "id": "1", "type": "start", "data": { "label": "Start Algorithm" } },
    { "id": "2", "type": "process", "data": { "label": "Initialize variables" } },
    { "id": "3", "type": "decision", "data": { "label": "Is condition met?" } },
    { "id": "4", "type": "process", "data": { "label": "Process when true" } },
    { "id": "5", "type": "process", "data": { "label": "Process when false" } },
    { "id": "6", "type": "end", "data": { "label": "End Algorithm" } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" },
    { "id": "e2-3", "source": "2", "target": "3" },
    { "id": "e3-4", "source": "3", "target": "4", "label": "Yes" },
    { "id": "e3-5", "source": "3", "target": "5", "label": "No" },
    { "id": "e4-6", "source": "4", "target": "6" },
    { "id": "e5-6", "source": "5", "target": "6" }
  ]
}

Follow these guidelines:
1. Start with a "start" node and end with an "end" node
2. Represent conditional branches with "decision" nodes
3. Represent loops by creating edges that point back to earlier nodes
4. Keep node labels concise but descriptive
5. Include all significant steps in the algorithm

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the JSON object, no additional text.
`

      // Create a promise that rejects after the timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("AI request timed out")), AI_REQUEST_TIMEOUT)
      })

      // Race the AI request against the timeout
      console.log("Sending request to Gemini API...")
      const result = await Promise.race([model.generateContent(prompt), timeoutPromise])

      // Extract the response text
      const responseText = result.response?.text() || ""
      console.log("Gemini response received, length:", responseText.length)
      console.log("First 100 chars of response:", responseText.substring(0, 100))

      // Extract just the JSON data
      let jsonData = responseText
      
      // If the response is wrapped in code blocks, extract just the JSON
      if (responseText.includes("```json")) {
        jsonData = responseText.split("```json")[1].split("```")[0].trim()
      } else if (responseText.includes("```")) {
        jsonData = responseText.split("```")[1].split("```")[0].trim()
      }
      
      //console.log("Extracted JSON data length:", jsonData.length)
      
      // Parse the JSON data
      let flowchartData
      try {
        flowchartData = JSON.parse(jsonData)
        console.log("Successfully parsed JSON data")
        
        // Validate the JSON structure
        if (!flowchartData.nodes || !flowchartData.edges || 
            !Array.isArray(flowchartData.nodes) || !Array.isArray(flowchartData.edges)) {
          throw new Error("Invalid JSON structure: missing nodes or edges arrays")
        }
        
        // Ensure all nodes have required properties
        for (const node of flowchartData.nodes) {
          if (!node.id || !node.type || !node.data || !node.data.label) {
            throw new Error("Invalid node structure: missing required properties")
          }
        }
        
        // Ensure all edges have required properties
        for (const edge of flowchartData.edges) {
          if (!edge.id || !edge.source || !edge.target) {
            throw new Error("Invalid edge structure: missing required properties")
          }
        }
        
      } catch (parseError) {
        console.error("Error parsing JSON data:", parseError)
        throw new Error("Failed to parse flowchart data from AI response")
      }

      console.log("Returning successful flowchart response")
      return NextResponse.json({ flowchartData })
    } catch (error) {
      console.error("Gemini generation error:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Use fallback flowchart data
      console.log("Using fallback flowchart data")
      const fallbackFlowchartData = generateFallbackFlowchartData(code, language)

      return NextResponse.json({
        flowchartData: fallbackFlowchartData,
        warning: `Error using Gemini API: ${errorMessage}. Using fallback flowchart generator.`,
      })
    }
  } catch (error) {
    console.error("Request processing error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Return a very basic flowchart as a last resort
    const basicFlowchartData = {
      nodes: [
        { id: "1", type: "start", data: { label: "Start" } },
        { id: "2", type: "process", data: { label: "Process Code" } },
        { id: "3", type: "end", data: { label: "End" } }
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e2-3", source: "2", target: "3" }
      ]
    }

    // Ensure we always return a valid JSON response
    return NextResponse.json({
      flowchartData: basicFlowchartData,
      error: `Failed to process request: ${errorMessage}. Using basic flowchart as fallback.`,
    })
  }
}

// Function to generate a fallback flowchart based on code analysis
function generateFallbackFlowchartData(code: string, language: string) {
  // This is a simple fallback that creates a basic flowchart structure
  // In a real implementation, you might want to do some basic code analysis here
  
  const nodes = [
    { id: "start", type: "start", data: { label: "Start Program" } },
    { id: "init", type: "process", data: { label: "Initialize Variables" } }
  ]
  
  const edges = [
    { id: "e-start-init", source: "start", target: "init" }
  ]
  
  // Check for common patterns in the code to add more nodes
  
  // Check for conditional statements
  if (code.includes("if") || code.includes("else")) {
    nodes.push({ id: "condition", type: "decision", data: { label: "Check Condition" } })
    edges.push({ id: "e-init-condition", source: "init", target: "condition" })
    
    nodes.push({ id: "true-branch", type: "process", data: { label: "True Branch" } })
    edges.push({ id: "e-condition-true", source: "condition", target: "true-branch", label: "Yes" })
    
    nodes.push({ id: "false-branch", type: "process", data: { label: "False Branch" } })
    edges.push({ id: "e-condition-false", source: "condition", target: "false-branch", label: "No" })
  }
  
  // Check for loops
  if (code.includes("for") || code.includes("while")) {
    const loopId = "loop"
    nodes.push({ id: loopId, type: "decision", data: { label: "Loop Condition" } })
    
    if (!code.includes("if")) {
      // If we didn't add a condition above, connect init to loop
      edges.push({ id: "e-init-loop", source: "init", target: loopId })
    } else {
      // Connect both branches to the loop
      edges.push({ id: "e-true-loop", source: "true-branch", target: loopId })
      edges.push({ id: "e-false-loop", source: "false-branch", target: loopId })
    }
    
    nodes.push({ id: "loop-body", type: "process", data: { label: "Loop Body" } })
    edges.push({ id: "e-loop-body", source: loopId, target: "loop-body", label: "Yes" })
    
    // Add loop back edge
    edges.push({ id: "e-loop-back", source: "loop-body", target: loopId })
  }
  
  // Add end node
  const endId = "end"
  nodes.push({ id: endId, type: "end", data: { label: "End Program" } })
  
  // Connect the last node to the end
  if (code.includes("for") || code.includes("while")) {
    edges.push({ id: "e-loop-end", source: "loop", target: endId, label: "No" })
  } else if (code.includes("if")) {
    // If there's no loop but there's a condition, connect both branches to end
    edges.push({ id: "e-true-end", source: "true-branch", target: endId })
    edges.push({ id: "e-false-end", source: "false-branch", target: endId })
  } else {
    // If there's no condition or loop, connect init directly to end
    edges.push({ id: "e-init-end", source: "init", target: endId })
  }
  
  return { nodes, edges }
}
