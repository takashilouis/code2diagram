import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Set a timeout for the AI request
const AI_REQUEST_TIMEOUT = 30000 // 30 seconds

export async function POST(req: NextRequest) {
  console.log("Sequence Diagram API route called - Starting sequence diagram generation process")

  try {
    // Parse the request body
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

    // Limit ideas length to prevent issues
    const maxIdeasLength = 5000
    if (ideas.length > maxIdeasLength) {
      ideas = ideas.substring(0, maxIdeasLength) + "\n// Text truncated due to length..."
      console.log("Ideas truncated to", maxIdeasLength, "characters")
    }

    // Use the Google Generative AI SDK directly
    try {
      console.log("Attempting to generate sequence diagram with Gemini")

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
You are an expert in sequence diagram creation. Given the following ideas or requirements, create a sequence diagram representation using a structured JSON format.

The user has provided these ideas:
"""
${ideas}
"""

Analyze these ideas and identify:
1. Participants in the sequence (people, systems, databases, etc.)
2. Messages between participants
3. The order of interactions
4. Any conditional logic or alternative paths

Return a JSON object with EXACTLY the following structure:

{
  "participants": ["Customer", "App", "Restaurant", "Owner", "Courier"],
  "sequence": [
    {"from": "Customer", "to": "App", "message": "Place order"},
    {"from": "App", "to": "Customer", "message": "Show 'Thanks for your order'"},
    {"from": "App", "to": "Restaurant", "message": "Send order request"},
    {"from": "Restaurant", "to": "Owner", "message": "Can we deliver?"},
    {
      "alt": "Owner says No",
      "sequence": [
        {"from": "Restaurant", "to": "App", "message": "Cannot fulfill order"},
        {"from": "App", "to": "Customer", "message": "Notify 'Order cancelled'"}
      ]
    },
    {
      "alt": "Owner says Yes",
      "sequence": [
        {"from": "Restaurant", "to": "App", "message": "Accept order"},
        {"from": "App", "to": "Courier", "message": "Find nearest available courier"},
        {"from": "App", "to": "Customer", "message": "Show 'Preparing the order'"},
        {"from": "Restaurant", "to": "App", "message": "Order ready"},
        {"from": "App", "to": "Courier", "message": "Notify to pick up order"},
        {"from": "Courier", "to": "Restaurant", "message": "Arrives to pick up"},
        {"from": "Restaurant", "to": "Courier", "message": "Hand over food"},
        {"from": "Courier", "to": "App", "message": "Start delivery"},
        {"from": "App", "to": "Customer", "message": "Show 'Delivering FOOD/DRINK' with live map"},
        {"from": "Courier", "to": "Customer", "message": "Arrives at location"},
        {"from": "Courier", "to": "App", "message": "Mark as delivered"},
        {"from": "App", "to": "Customer", "message": "Show 'Delivered'"}
      ]
    }
  ]
}

Guidelines:
- Replace the participants and messages with ones that match the user's ideas
- The "participants" array should contain all actors/systems involved in the sequence
- Each message in the "sequence" array represents an interaction between participants
- For conditional logic or alternative paths, use the "alt" structure with its own nested "sequence"
- Make sure all participants mentioned in messages are included in the participants array
- Keep message descriptions clear and concise
- Maintain the chronological order of interactions

Make sure to extract all relevant participants and messages from the user's ideas. Be creative but accurate in interpreting the sequence of events described.

Output ONLY the JSON object, nothing else.
`

      // Create a promise that rejects after the timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("AI request timed out")), AI_REQUEST_TIMEOUT)
      })

      // Race the AI request against the timeout
      console.log("Sending request to Gemini API...")
      const result = await Promise.race([model.generateContent(prompt), timeoutPromise]) as any

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
      
      console.log("Extracted JSON data length:", jsonData.length)
      
      // Parse the JSON data
      let structuredData
      let flowchartData
      try {
        structuredData = JSON.parse(jsonData)
        console.log("Successfully parsed JSON data")
        
        // Validate the structured JSON format
        if (!structuredData.participants || !structuredData.sequence || 
            !Array.isArray(structuredData.participants) || !Array.isArray(structuredData.sequence)) {
          throw new Error("Invalid JSON structure: missing participants or sequence arrays")
        }
        
        // Convert the structured format to the nodes/edges format for compatibility with the visualization
        flowchartData = convertStructuredToGraphFormat(structuredData)
        
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
      console.log("Using fallback sequence diagram data")
      const fallbackStructuredData = generateFallbackSequenceDiagramData(ideas)

      return NextResponse.json({
        flowchartData: fallbackStructuredData,
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

    // Ensure we always return a valid JSON response
    return NextResponse.json({
      flowchartData: basicFlowchartData,
      error: `Failed to process request: ${errorMessage}. Using basic diagram as fallback.`,
    })
  }
}

// Function to convert the structured format to the nodes/edges format
function convertStructuredToGraphFormat(structuredData: { 
  participants: string[], 
  sequence: Array<any>
}) {
  const { participants, sequence } = structuredData
  
  // Create nodes from participants
  const nodes = participants.map((participant, index) => {
    // Determine the appropriate type based on the participant name
    let type = "actor"
    if (participant.toLowerCase().includes("system") || 
        participant.toLowerCase().includes("app") || 
        participant.toLowerCase().includes("service")) {
      type = "system"
    } else if (participant.toLowerCase().includes("database") || 
               participant.toLowerCase().includes("storage")) {
      type = "database"
    } else if (participant.toLowerCase().includes("server") || 
               participant.toLowerCase().includes("api")) {
      type = "component"
    }
    
    return {
      id: participant.toLowerCase().replace(/\s+/g, '_'),
      type,
      data: { label: participant }
    }
  })
  
  // Create edges from sequence
  const edges: Array<{id: string, source: string, target: string, label: string}> = []
  let edgeCounter = 1
  
  // Helper function to process a sequence array
  const processSequence = (sequenceArray: Array<any>, isInAlt: boolean = false) => {
    sequenceArray.forEach(item => {
      if (item.alt) {
        // Add a special edge for the alt condition
        // Find a suitable source node (preferably a system node)
        const systemNode = nodes.find(n => n.type === "system")
        const sourceId = systemNode ? systemNode.id : nodes[0].id
        
        edges.push({
          id: `e${edgeCounter++}`,
          source: sourceId,
          target: sourceId, // Self-referencing to indicate a condition
          label: `[${item.alt}]`
        })
        
        // Process the nested sequence
        if (item.sequence && Array.isArray(item.sequence)) {
          processSequence(item.sequence, true)
        }
      } else if (item.from && item.to && item.message) {
        // Find the corresponding node IDs
        const fromParticipant = item.from
        const toParticipant = item.to
        
        const sourceNode = nodes.find(n => n.data.label === fromParticipant)
        const targetNode = nodes.find(n => n.data.label === toParticipant)
        
        if (sourceNode && targetNode) {
          edges.push({
            id: `e${edgeCounter++}`,
            source: sourceNode.id,
            target: targetNode.id,
            label: item.message
          })
        }
      }
    })
  }
  
  // Process the main sequence
  processSequence(sequence)
  
  return { nodes, edges }
}

// Function to generate a fallback sequence diagram based on text analysis
function generateFallbackSequenceDiagramData(ideas: string) {
  // Extract potential participants from the ideas text
  const participantKeywords = [
    { keyword: /\b(?:user|customer|client|person|patient|student)s?\b/gi, defaultLabel: "User" },
    { keyword: /\b(?:system|app|application|platform|service|website|software)s?\b/gi, defaultLabel: "System" },
    { keyword: /\b(?:database|db|storage|repository|store)s?\b/gi, defaultLabel: "Database" },
    { keyword: /\b(?:server|api|backend|cloud)s?\b/gi, defaultLabel: "Server" },
    { keyword: /\b(?:browser|frontend|client|interface)s?\b/gi, defaultLabel: "Client" }
  ]
  
  // Extract participants from the text
  const participants: string[] = []
  const foundParticipants = new Set<string>()
  
  participantKeywords.forEach(({ keyword, defaultLabel }) => {
    const matches = ideas.match(keyword) || []
    matches.forEach(match => {
      const normalizedMatch = match.toLowerCase().trim()
      if (!foundParticipants.has(normalizedMatch)) {
        foundParticipants.add(normalizedMatch)
        const label = match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
        participants.push(label)
      }
    })
  })
  
  // If no participants were found, add default ones
  if (participants.length === 0) {
    participants.push("User", "System")
  } else if (participants.length === 1) {
    // If only one participant was found, add a system to interact with
    participants.push("System")
  }
  
  // Extract sentences to create messages
  const sentences = ideas.split(/[.!?]\s+/)
  const sequence: Array<any> = []
  
  // Create messages based on sentence analysis
  sentences.forEach((sentence, index) => {
    if (sentence.trim() === '') return
    
    // Check if this might be a conditional statement
    const isConditional = /\b(?:if|when|once|else|otherwise|alternatively)\b/gi.test(sentence)
    
    if (isConditional) {
      // Create an alt block
      sequence.push({
        alt: sentence.trim(),
        sequence: [
          {
            from: participants[0],
            to: participants.length > 1 ? participants[1] : participants[0],
            message: "Action based on condition"
          }
        ]
      })
    } else {
      // Try to identify participants in the sentence
      let fromParticipant: string | null = null
      let toParticipant: string | null = null
      
      for (const participant of participants) {
        if (sentence.toLowerCase().includes(participant.toLowerCase())) {
          if (!fromParticipant) {
            fromParticipant = participant
          } else if (!toParticipant) {
            toParticipant = participant
            break
          }
        }
      }
      
      // If we couldn't identify both participants, make some assumptions
      if (!fromParticipant && !toParticipant) {
        // Default to first -> second participant interaction
        fromParticipant = participants[0]
        toParticipant = participants.length > 1 ? participants[1] : participants[0]
      } else if (fromParticipant && !toParticipant) {
        // Find a suitable target
        const otherParticipants = participants.filter(p => p !== fromParticipant)
        toParticipant = otherParticipants.length > 0 ? otherParticipants[0] : fromParticipant
      } else if (!fromParticipant && toParticipant) {
        // Find a suitable source
        const otherParticipants = participants.filter(p => p !== toParticipant)
        fromParticipant = otherParticipants.length > 0 ? otherParticipants[0] : toParticipant
      }
      
      if (fromParticipant && toParticipant) {
        sequence.push({
          from: fromParticipant,
          to: toParticipant,
          message: sentence.trim()
        })
      }
    }
  })
  
  // If no messages were created, add some default ones
  if (sequence.length === 0 && participants.length >= 2) {
    sequence.push(
      {
        from: participants[0],
        to: participants[1],
        message: "Request"
      },
      {
        from: participants[1],
        to: participants[0],
        message: "Response"
      }
    )
  }
  
  // Return the structured format
  return convertStructuredToGraphFormat({ participants, sequence })
}
