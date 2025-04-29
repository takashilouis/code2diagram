"use client"

import { useEffect, useRef } from "react"
import mermaid from "mermaid"

export function TestDiagram() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    })

    // Simple test diagram
    const testDiagram = `graph TD
  A[Start main()] --> B{n === 0 || n === 1?}
  B -- Yes --> C[Return 1]
  B -- No --> D[Return n * calculateFactorial(n-1)]
  C --> E[End]
  D --> E`

    // Create a new div with the mermaid class
    containerRef.current.innerHTML = ''
    const mermaidDiv = document.createElement('div')
    mermaidDiv.className = 'mermaid'
    mermaidDiv.textContent = testDiagram
    containerRef.current.appendChild(mermaidDiv)

    // Render the diagram
    setTimeout(() => {
      mermaid.contentLoaded()
    }, 100)
  }, [])

  return (
    <div className="border p-4 rounded-md bg-white dark:bg-gray-900">
      <h3 className="mb-4 font-medium">Test Diagram</h3>
      <div ref={containerRef} className="flex justify-center"></div>
    </div>
  )
}
