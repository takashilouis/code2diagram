"use client"

import { useState, useEffect } from "react"

export interface DiagramHistoryItem {
  id: string
  code: string
  language: string
  diagramType: string
  diagram: string
  timestamp: number
}

export function useDiagramHistory(maxItems = 10) {
  const [history, setHistory] = useState<DiagramHistoryItem[]>([])

  // Load history from localStorage on initial render
  useEffect(() => {
    const savedHistory = localStorage.getItem("diagram-history")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error("Error loading diagram history:", error)
        // If there's an error, clear the history
        localStorage.removeItem("diagram-history")
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("diagram-history", JSON.stringify(history))
  }, [history])

  const addToHistory = (item: Omit<DiagramHistoryItem, "id" | "timestamp">) => {
    setHistory((prevHistory) => {
      // Create a new history item with id and timestamp
      const newItem: DiagramHistoryItem = {
        ...item,
        id: generateId(),
        timestamp: Date.now(),
      }

      // Add to the beginning of the array and limit the size
      const updatedHistory = [newItem, ...prevHistory].slice(0, maxItems)
      return updatedHistory
    })
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("diagram-history")
  }

  const removeFromHistory = (id: string) => {
    setHistory((prevHistory) => prevHistory.filter((item) => item.id !== id))
  }

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  }
}

// Helper function to generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
