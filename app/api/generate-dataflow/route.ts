import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

//set a timeout for the AI request
const AI_REQUEST_TIMEOUT = 30000 // 30 seconds

export async function POST(req: NextRequest) {
  console.log("Sequence Diagram API route called - Starting sequence diagram generation process")

  try {
    //parse the request body
    let ideas
    try {
      const body = await req.json()
      ideas = body.ideas
      console.log("Received ideas length:", ideas?.length || 0)
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body. Please provide valid JSON." }, { status: 400 })
    }

    if (!ideas) {
      return NextResponse.json({ error: "Ideas text is required" }, { status: 400 })
    }

    //limit ideas length to prevent issues
    const maxIdeasLength = 5000
    if (ideas.length > maxIdeasLength) {
      ideas = ideas.substring(0, maxIdeasLength) + "\n// Text truncated due to length..."
      console.log("Ideas truncated to", maxIdeasLength, "characters")
    }

    //use the Google Generative AI SDK directly
    try {
      console.log("Attempting to generate dataflow with Gemini")

      //get API key from environment variable
      const apiKey = process.env.GOOGLE_API_KEY
      console.log("API Key exists:", !!apiKey)
      if (!apiKey) {
        throw new Error("GOOGLE_API_KEY environment variable is not set")
      }

      //initialize the Gemini API
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

      const prompt = `
You are an expert in sequence diagram creation. Given the following ideas or requirements, create a sequence diagram representation using a JSON format that can be visualized with D3.js.

The user has provided these ideas:
"""
${ideas}
"""

Analyze these ideas and identify:
1. Actors/participants in the sequence
2. Messages between participants
3. The order of interactions
4. Any conditional logic or loops
5. Return messages and responses

Return a JSON object with the following structure:
{
  "nodes": [
    { "id": "1", "type": "actor", "data": { "label": "User" } },
    { "id": "2", "type": "system", "data": { "label": "System" } },
    { "id": "3", "type": "database", "data": { "label": "Database" } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2", "label": "Request data" },
    { "id": "e2-3", "source": "2", "target": "3", "label": "Query database" },
    { "id": "e3-2", "source": "3", "target": "2", "label": "Return results" },
    { "id": "e2-1", "source": "2", "target": "1", "label": "Display data" }
  ]
}

Node types should be one of: "actor", "system", "database", "external", or "component".
Each node must have a unique id, appropriate type, and descriptive label.
Each edge must connect existing nodes and describe the message being sent.
The edges should be ordered to represent the sequence of interactions.

Output ONLY the JSON object, nothing else.
`

      //create a promise that rejects after the timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("AI request timed out")), AI_REQUEST_TIMEOUT)
      })

      // Race the AI request against the timeout
      console.log("Sending request to Gemini API...")
      const result = await Promise.race([model.generateContent(prompt), timeoutPromise]) as any

      //extract the response text
      const responseText = result.response?.text() || ""
      //console.log("Gemini response received, length:", responseText.length)
      //console.log("First 100 chars of response:", responseText.substring(0, 100))

      // Extract just the JSON data
      let jsonData = responseText
      
      // If the response is wrapped in code blocks, extract just the JSON
      if (responseText.includes("```json")) {
        jsonData = responseText.split("```json")[1].split("```")[0].trim()
      } else if (responseText.includes("```")) {
        jsonData = responseText.split("```")[1].split("```")[0].trim()
      }
      
      console.log("Extracted JSON data length:", jsonData.length)
      
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

      console.log("Returning successful dataflow response")
      return NextResponse.json({ flowchartData })
    } catch (error) {
      console.error("Gemini generation error:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Use fallback flowchart data
      console.log("Using fallback sequence diagram data")
      const fallbackFlowchartData = generateFallbackSequenceDiagramData(ideas)

      return NextResponse.json({
        flowchartData: fallbackFlowchartData,
        warning: `Error using Gemini API: ${errorMessage}. Using fallback sequence diagram generator.`,
      })
    }
  } catch (error) {
    console.error("Request processing error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Return a very basic sequence diagram as a last resort
    const basicFlowchartData = {
      nodes: [
        { id: "1", type: "actor", data: { label: "User" } },
        { id: "2", type: "system", data: { label: "System" } },
        { id: "3", type: "database", data: { label: "Database" } }
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", label: "Request" },
        { id: "e2-3", source: "2", target: "3", label: "Query" },
        { id: "e3-2", source: "3", target: "2", label: "Response" },
        { id: "e2-1", source: "2", target: "1", label: "Result" }
      ]
    }

    //ensure we always return a valid JSON response
    return NextResponse.json({
      flowchartData: basicFlowchartData,
      error: `Failed to process request: ${errorMessage}. Using basic dataflow as fallback.`,
    })
  }
}

//function to generate a fallback sequence diagram based on text analysis
function generateFallbackSequenceDiagramData(ideas: string) {
  //extract potential actors/systems from the ideas text
  const words = ideas.split(/\s+/)
  const potentialActors = words.filter(word => 
    word.length > 5 && 
    !word.match(/^(and|with|from|into|using|through|between|among|within)$/i)
  ).slice(0, 3) // Take up to 3 potential actors
  
  //create basic actors
  const nodes = [
    { id: "1", type: "actor", data: { label: "User" } },
    { id: "2", type: "system", data: { label: "System" } },
  ]
  
  //add additional actors based on extracted text
  potentialActors.forEach((actor, index) => {
    if (index < 2) { // Skip first two as we already have User and System
      return
    }
    nodes.push({ 
      id: (index + 1).toString(), 
      type: ideas.match(/database|storage|repository/i) ? "database" : "component", 
      data: { label: actor.charAt(0).toUpperCase() + actor.slice(1) } 
    })
  })
  
  //if database is mentioned but not added yet, add it
  if (ideas.match(/database|storage|repository/i) && !nodes.some(n => n.type === "database")) {
    nodes.push({ id: (nodes.length + 1).toString(), type: "database", data: { label: "Database" } })
  }
  
  //create basic sequence of interactions
  const edges = [
    { id: "e1-2", source: "1", target: "2", label: "Request" },
  ]
  
  //add database interaction if present
  const dbNode = nodes.find(n => n.type === "database")
  if (dbNode) {
    edges.push({ 
      id: `e2-${dbNode.id}`, 
      source: "2", 
      target: dbNode.id,
      label: "Query data"
    })
    
    edges.push({ 
      id: `e${dbNode.id}-2`, 
      source: dbNode.id, 
      target: "2",
      label: "Return results"
    })
  }
  
  //add response back to user
  edges.push({ 
    id: "e2-1", 
    source: "2", 
    target: "1",
    label: "Response"
  })
  
  //add additional interactions based on keywords in the ideas
  if (ideas.match(/login|authenticate|verify/i)) {
    edges.push({ 
      id: "e1-2-auth", 
      source: "1", 
      target: "2",
      label: "Authenticate"
    })
  }
  
  if (ideas.match(/create|add|insert|post/i)) {
    const targetId = dbNode ? dbNode.id : "2"
    edges.push({ 
      id: `e2-${targetId}-create`, 
      source: "2", 
      target: targetId,
      label: "Create data"
    })
  }
  
  return { nodes, edges }
}
