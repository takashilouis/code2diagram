"use client"

import type React from "react"
import { Textarea } from "@/components/ui/textarea"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const defaultCode = `function calculateFactorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  
  return n * calculateFactorial(n - 1);
}

function main() {
  const number = 5;
  const result = calculateFactorial(number);
  console.log(\`The factorial of \${number} is \${result}\`);
}

main();`

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  // Use the provided value or default code if value is empty
  const displayValue = value || defaultCode

  return (
    <Textarea
      value={displayValue}
      onChange={handleChange}
      className="font-mono h-[400px] resize-none"
      placeholder="Paste your code here..."
    />
  )
}
