import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { generateEnhancedFallbackDiagram } from "@/lib/fallback-diagram-generator"

// Set a timeout for the AI request
const AI_REQUEST_TIMEOUT = 30000 // 30 seconds

export async function POST(req: NextRequest) {
  console.log("API route called - Starting diagram generation process")

  try {
    // Parse the request body
    let code, language, diagramType
    try {
      const body = await req.json()
      code = body.code
      language = body.language || "javascript"
      diagramType = body.diagramType || "flowchart"
      console.log("Received code length:", code?.length || 0)
      console.log("Language:", language)
      console.log("Diagram type:", diagramType)
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
      console.log("Attempting to generate diagram with Gemini")

      // Get API key from environment variable
      const apiKey = process.env.GOOGLE_API_KEY
      console.log("API Key exists:", !!apiKey)
      if (!apiKey) {
        throw new Error("GOOGLE_API_KEY environment variable is not set")
      }
      console.log("API Key first 4 chars:", apiKey.substring(0, 4))

      // Initialize the Gemini API
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

      // Create prompt based on diagram type
      let diagramTypeText, syntaxRules

      if (diagramType === "sequence") {
        diagramTypeText = "sequence diagram"
        syntaxRules = `
1. Start with "sequenceDiagram" on its own line
2. Define participants: participant A
3. Show interactions with arrows: A->>B: Message
4. Use -->> for return messages
5. Use + and - for activation boxes
6. Each statement should be on its own line
7. Indent all lines after "sequenceDiagram" with two spaces`
      } else if (diagramType === "class") {
        diagramTypeText = "class diagram"
        syntaxRules = `
1. Start with "classDiagram" on its own line
2. Define classes: class ClassName
3. Define methods and properties inside classes using indentation
4. Show relationships with arrows: ClassA --> ClassB
5. Each statement should be on its own line
6. Indent all lines after "classDiagram" with two spaces`
      } else {
        diagramTypeText = "flowchart"
        syntaxRules = `
1. Start with "graph TD" on its own line
2. Each node must have a unique ID (like A, B, C or node1, node2)
3. Node text must be in square brackets: A[Text here]
4. Conditions should use curly braces: B{Condition}
5. Connections use -->: A --> B
6. Each statement should be on its own line
7. Indent all lines after "graph TD" with two spaces`
      }

      const prompt = `
You are an expert code analyst and diagram generator. Given the following ${language} code, extract the logical structure (such as function definitions, if/else conditions, loops, function calls) and convert it into a ${diagramTypeText} representation using Mermaid.js syntax.

Analyze the code for key control flow constructs: if, else, for, while, function definitions, return, and function calls.

IMPORTANT: Follow these rules for valid Mermaid ${diagramTypeText} syntax:
${syntaxRules}

Output ONLY the Mermaid.js diagram code, nothing else.

Here's the code:
\`\`\`${language}
${code}
\`\`\`
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
      // console.log("Gemini response received, length:", responseText.length)
      //console.log("First 100 chars of response:", responseText.substring(0, 100))

      // Extract just the Mermaid diagram code
      let mermaidCode = responseText
      console.log("Contains ```mermaid:", responseText.includes("```mermaid"))
      console.log("Contains ```:", responseText.includes("```"))
      
      if (responseText.includes("```mermaid")) {
        mermaidCode = responseText.split("```mermaid")[1].split("```")[0].trim()
      } else if (responseText.includes("```")) {
        mermaidCode = responseText.split("```")[1].split("```")[0].trim()
      }
      
      console.log("Extracted mermaid code length:", mermaidCode.length)
      console.log("First 100 chars of mermaid code:", mermaidCode.substring(0, 100))

      // Validate that we have a valid Mermaid diagram
      const diagramStartText =
        diagramType === "sequence" ? "sequenceDiagram" : diagramType === "class" ? "classDiagram" : "graph TD"

      if (!mermaidCode || !mermaidCode.includes(diagramStartText)) {
        console.log(`Invalid ${diagramType} diagram from Gemini, using enhanced fallback`)
        console.log(`Expected diagram to include: ${diagramStartText}, but it doesn't`)
        mermaidCode = generateEnhancedFallbackDiagram(code, language, diagramType)
        console.log("Fallback diagram generated, length:", mermaidCode.length)
        console.log("First 100 chars of fallback diagram:", mermaidCode.substring(0, 100))
        return NextResponse.json({
          diagram: mermaidCode,
          warning: `Gemini didn't generate a valid ${diagramType} diagram. Using enhanced fallback generator.`,
        })
      }

      console.log("Returning successful diagram response")
      return NextResponse.json({ diagram: mermaidCode })
    } catch (error) {
      console.error("Gemini generation error:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Use enhanced fallback diagram generator
      console.log("Using enhanced fallback diagram generator")
      const fallbackDiagram = generateEnhancedFallbackDiagram(code, language, diagramType)

      return NextResponse.json({
        diagram: fallbackDiagram,
        warning: `Error using Gemini API: ${errorMessage}. Using enhanced fallback diagram generator.`,
      })
    }
  } catch (error) {
    console.error("Request processing error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    // Return a very basic diagram as a last resort
    const basicDiagram = `graph TD
  A[Start] --> B[Process Code]
  B --> C[End]`

    // Ensure we always return a valid JSON response
    return NextResponse.json({
      diagram: basicDiagram,
      error: `Failed to process request: ${errorMessage}. Using basic diagram as fallback.`,
    })
  }
}
