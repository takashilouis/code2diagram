import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json()

    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json({ success: false, error: "API key is required" }, { status: 400 })
    }

    // Validate the API key by making a test request to Gemini
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

      // Make a simple test request
      await model.generateContent("Hello, this is a test request to validate the API key.")

      // If we get here, the API key is valid

      // In a production environment, you would update the environment variable
      // For now, we'll just return success
      // Note: In a real app, you would need to store this in a secure way

      return NextResponse.json({
        success: true,
        message:
          "API key validated successfully. In a production environment, this would update your environment variable.",
      })
    } catch (error) {
      console.error("Error validating API key:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid API key. Please check your API key and try again.",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error updating API key:", error)
    return NextResponse.json({ success: false, error: "Failed to update API key" }, { status: 500 })
  }
}
