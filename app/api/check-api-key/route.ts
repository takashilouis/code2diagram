import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY

    //check if API key exists
    const isConfigured = !!apiKey && apiKey.trim() !== ""

    //for security, we'll only return a masked version of the key
    let maskedKey = ""
    if (isConfigured && apiKey) {
      //show only the first 4 and last 4 characters
      maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "****"
    }

    return NextResponse.json({
      isConfigured,
      maskedKey: process.env.NODE_ENV === "development" ? maskedKey : undefined,
    })
  } catch (error) {
    console.error("Error checking API key:", error)
    return NextResponse.json({ isConfigured: false, error: "Failed to check API key" }, { status: 500 })
  }
}
