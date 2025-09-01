"use client"

import { useEffect, useRef } from "react"
import { Editor } from "@monaco-editor/react"
import { cn } from "@/lib/utils"

interface IdeasEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function IdeasEditor({ value, onChange, className }: IdeasEditorProps) {
  const editorRef = useRef<any>(null)

  // Handle editor mount
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
    
    // Focus the editor when it mounts
    if (editor) {
      setTimeout(() => {
        editor.focus()
      }, 100)
    }
  }

  // Handle editor change
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || "")
  }

  // Update editor options when theme changes
  useEffect(() => {
    if (editorRef.current) {
      const isDarkMode = document.documentElement.classList.contains("dark")
      editorRef.current.updateOptions({
        theme: isDarkMode ? "vs-dark" : "vs",
      })
    }
  }, [])

  return (
    <div className={cn("border rounded-md overflow-hidden h-[400px]", className)}>
      <Editor
        height="100%"
        defaultLanguage="markdown"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          wordWrap: "on",
          wrappingIndent: "none",
          automaticLayout: true,
          lineNumbers: "off",
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 0,
          renderLineHighlight: "none",
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  )
}
