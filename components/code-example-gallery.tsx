"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Code, Copy, Check } from "lucide-react"

interface CodeExample {
  name: string
  language: string
  code: string
  description: string
}

const EXAMPLES: Record<string, CodeExample[]> = {
  javascript: [
    {
      name: "Factorial Function",
      language: "javascript",
      description: "A recursive function to calculate the factorial of a number",
      code: `function calculateFactorial(n) {
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

main();`,
    },
    {
      name: "Binary Search",
      language: "javascript",
      description: "An implementation of the binary search algorithm",
      code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    }
    
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

function main() {
  const sortedArray = [1, 3, 5, 7, 9, 11, 13, 15];
  const target = 7;
  const result = binarySearch(sortedArray, target);
  
  if (result !== -1) {
    console.log(\`Found target at index \${result}\`);
  } else {
    console.log("Target not found");
  }
}

main();`,
    },
  ],
  python: [
    {
      name: "Bubble Sort",
      language: "python",
      description: "An implementation of the bubble sort algorithm",
      code: `def bubble_sort(arr):
    n = len(arr)
    
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    
    return arr

def main():
    unsorted_array = [64, 34, 25, 12, 22, 11, 90]
    sorted_array = bubble_sort(unsorted_array.copy())
    
    print(f"Unsorted array: {unsorted_array}")
    print(f"Sorted array: {sorted_array}")

if __name__ == "__main__":
    main()`,
    },
    {
      name: "Fibonacci Sequence",
      language: "python",
      description: "A function to generate the Fibonacci sequence",
      code: `def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    
    return fib

def main():
    n = 10
    fib_sequence = fibonacci(n)
    print(f"Fibonacci sequence of {n} numbers: {fib_sequence}")

if __name__ == "__main__":
    main()`,
    },
  ],
  java: [
    {
      name: "Quick Sort",
      language: "java",
      description: "An implementation of the quick sort algorithm",
      code: `public class QuickSort {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            
            quickSort(arr, low, pivotIndex - 1);
            quickSort(arr, pivotIndex + 1, high);
        }
    }
    
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        
        return i + 1;
    }
    
    public static void main(String[] args) {
        int[] arr = {10, 7, 8, 9, 1, 5};
        
        System.out.println("Unsorted array:");
        for (int num : arr) {
            System.out.print(num + " ");
        }
        
        quickSort(arr, 0, arr.length - 1);
        
        System.out.println("\\nSorted array:");
        for (int num : arr) {
            System.out.print(num + " ");
        }
    }
}`,
    },
  ],
}

interface CodeExampleGalleryProps {
  onSelectExample: (example: CodeExample) => void
}

export function CodeExampleGallery({ onSelectExample }: CodeExampleGalleryProps) {
  const [language, setLanguage] = useState<string>("javascript")
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (code: string, name: string) => {
    navigator.clipboard.writeText(code)
    setCopied(name)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Code Examples</CardTitle>
        <CardDescription>Select an example to visualize</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="javascript" onValueChange={setLanguage}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="javascript">JavaScript</TabsTrigger>
            <TabsTrigger value="python">Python</TabsTrigger>
            <TabsTrigger value="java">Java</TabsTrigger>
          </TabsList>

          <TabsContent value={language} className="space-y-4">
            {EXAMPLES[language]?.map((example) => (
              <Card key={example.name} className="overflow-hidden">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{example.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(example.code, example.name)}
                        className="h-8 px-2"
                      >
                        {copied === example.name ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="default" size="sm" onClick={() => onSelectExample(example)} className="h-8 px-2">
                        <Code className="h-4 w-4 mr-1" />
                        Use
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{example.description}</CardDescription>
                </CardHeader>
                <div className="bg-muted p-4 overflow-x-auto">
                  <pre className="text-xs">
                    <code>{example.code.substring(0, 150)}...</code>
                  </pre>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
