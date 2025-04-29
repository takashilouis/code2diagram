// Enhanced fallback diagram generator

export function generateEnhancedFallbackDiagram(code: string, language: string, diagramType: string): string {
  try {
    if (diagramType === "sequence") {
      return generateEnhancedSequenceDiagram(code, language)
    } else if (diagramType === "class") {
      return generateEnhancedClassDiagram(code, language)
    } else {
      // Default to flowchart
      return generateEnhancedFlowchart(code, language)
    }
  } catch (error) {
    console.error("Error generating enhanced fallback diagram:", error)
    return getBasicDiagram(diagramType)
  }
}

function generateEnhancedFlowchart(code: string, language: string): string {
  try {
    // Initialize diagram
    let diagram = "graph TD\n"

    // Extract functions, classes, and control structures
    const functions = extractFunctions(code, language)
    const controlStructures = extractControlStructures(code, language)

    if (functions.length === 0 && controlStructures.length === 0) {
      return `graph TD
  Start[Start] --> Process[Process Code]
  Process --> End[End]`
    }

    // Add start node
    diagram += "  Start[Start] --> "

    // If we have a main/init function, connect start to it
    const mainFunction = functions.find(
      (f) => f.toLowerCase().includes("main") || f.toLowerCase().includes("init") || f.toLowerCase() === "app",
    )

    if (mainFunction) {
      diagram += `Main["${mainFunction}"]\n`

      // Process the main function and its control flow
      const mainControlStructures = controlStructures.filter(
        (cs) =>
          code.indexOf(mainFunction) < code.indexOf(cs.name) &&
          code.indexOf(cs.name) < code.indexOf(mainFunction) + 500, // Rough estimate of function scope
      )

      let currentNode = "Main"

      mainControlStructures.forEach((cs, index) => {
        if (cs.type === "if") {
          diagram += `  ${currentNode} --> Cond${index}{"${cs.name}"}\n`
          diagram += `  Cond${index} -->|Yes| Then${index}["Then Branch"]\n`
          diagram += `  Cond${index} -->|No| Else${index}["Else Branch"]\n`

          // Both branches converge
          diagram += `  Then${index} --> AfterIf${index}[After If]\n`
          diagram += `  Else${index} --> AfterIf${index}\n`

          currentNode = `AfterIf${index}`
        } else if (cs.type === "loop") {
          diagram += `  ${currentNode} --> Loop${index}{"${cs.name}"}\n`
          diagram += `  Loop${index} -->|Each Iteration| Body${index}["Loop Body"]\n`
          diagram += `  Body${index} --> Loop${index}\n`
          diagram += `  Loop${index} -->|Done| AfterLoop${index}[After Loop]\n`

          currentNode = `AfterLoop${index}`
        }
      })

      // Connect to other functions if they exist
      const otherFunctions = functions.filter((f) => f !== mainFunction)

      if (otherFunctions.length > 0) {
        otherFunctions.forEach((func, index) => {
          diagram += `  ${currentNode} --> Func${index}["${func}"]\n`

          // If this is the last function, connect to End
          if (index === otherFunctions.length - 1) {
            diagram += `  Func${index} --> End[End]\n`
          }
        })
      } else {
        // If no other functions, connect directly to End
        diagram += `  ${currentNode} --> End[End]\n`
      }
    } else {
      // No main function found, create a simpler diagram with all functions
      functions.forEach((func, index) => {
        diagram += `Func${index}["${func}"]`

        if (index < functions.length - 1) {
          diagram += ` --> Func${index + 1}["${functions[index + 1]}"]\n  `
        } else {
          diagram += ` --> End[End]\n`
        }
      })
    }

    return diagram
  } catch (error) {
    console.error("Error generating enhanced flowchart:", error)
    return `graph TD
  A[Start] --> B[Process Code]
  B --> C[End]`
  }
}

function generateEnhancedSequenceDiagram(code: string, language: string): string {
  try {
    // Initialize diagram
    let diagram = "sequenceDiagram\n"

    // Extract functions and classes
    const functions = extractFunctions(code, language)
    const classes = extractClasses(code, language)

    if (functions.length === 0 && classes.length === 0) {
      return `sequenceDiagram
  participant User
  participant System
  User->>System: Execute Code
  System->>User: Return Result`
    }

    // Add participants
    diagram += "  participant Main\n"

    // Add classes as participants if they exist
    if (classes.length > 0) {
      classes.forEach((cls) => {
        diagram += `  participant ${cls}\n`
      })
    }

    // Add functions as participants
    functions.forEach((func) => {
      // Skip if the function name is already added as a class
      if (!classes.includes(func)) {
        diagram += `  participant ${func}\n`
      }
    })

    // Add interactions
    diagram += "  Main->>Main: Start Execution\n"

    // Find the main/init function
    const mainFunction = functions.find(
      (f) => f.toLowerCase().includes("main") || f.toLowerCase().includes("init") || f.toLowerCase() === "app",
    )

    if (mainFunction) {
      // Main function calls other functions
      const otherFunctions = functions.filter((f) => f !== mainFunction)

      otherFunctions.forEach((func, index) => {
        diagram += `  Main->>+${func}: Call Function\n`

        // Add some internal processing based on code content
        if (code.includes("if") || code.includes("else")) {
          diagram += `  ${func}->>+${func}: Check Condition\n`
          diagram += `  ${func}-->>-${func}: Process Result\n`
        }

        if (code.includes("for") || code.includes("while")) {
          diagram += `  ${func}->>+${func}: Loop Processing\n`
          diagram += `  ${func}-->>-${func}: Complete Loop\n`
        }

        // Return to Main
        diagram += `  ${func}-->>-Main: Return Result\n`
      })

      // Main completes execution
      diagram += `  Main-->>Main: Complete Execution\n`
    } else {
      // No main function found, create a simpler diagram with all functions
      let previousFunc = "Main"

      functions.forEach((func, index) => {
        diagram += `  ${previousFunc}->>+${func}: Call\n`
        diagram += `  ${func}-->>-${previousFunc}: Return\n`

        previousFunc = func
      })
    }

    return diagram
  } catch (error) {
    console.error("Error generating enhanced sequence diagram:", error)
    return `sequenceDiagram
  participant User
  participant System
  User->>System: Execute Code
  System->>User: Return Result`
  }
}

function generateEnhancedClassDiagram(code: string, language: string): string {
  try {
    // Initialize diagram
    let diagram = "classDiagram\n"

    // Extract classes and functions
    const classes = extractClasses(code, language)
    const functions = extractFunctions(code, language)

    if (classes.length === 0 && functions.length === 0) {
      return `classDiagram
  class Main {
    +execute()
  }
  class Helper {
    +process()
  }
  Main --> Helper`
    }

    // If we have actual classes, use them
    if (classes.length > 0) {
      classes.forEach((cls) => {
        diagram += `  class ${cls} {\n`

        // Add methods based on code analysis
        const classMethods = extractClassMethods(code, cls, language)

        if (classMethods.length > 0) {
          classMethods.forEach((method) => {
            diagram += `    +${method}()\n`
          })
        } else {
          // Add placeholder methods
          diagram += `    +execute()\n`
        }

        diagram += `  }\n`
      })

      // Add relationships between classes if multiple classes exist
      if (classes.length > 1) {
        for (let i = 0; i < classes.length - 1; i++) {
          // Try to determine relationship type based on code
          if (code.includes(`extends ${classes[i + 1]}`) || code.includes(`${classes[i + 1]}.prototype`)) {
            diagram += `  ${classes[i]} --|> ${classes[i + 1]}: Inherits\n`
          } else if (code.includes(`new ${classes[i + 1]}`) || code.includes(`${classes[i + 1]}.create`)) {
            diagram += `  ${classes[i]} --> ${classes[i + 1]}: Uses\n`
          } else {
            diagram += `  ${classes[i]} --> ${classes[i + 1]}\n`
          }
        }
      }
    } else {
      // No classes found, create classes from functions
      diagram += `  class Program {\n`
      diagram += `    +main()\n`
      diagram += `  }\n`

      functions.forEach((func) => {
        diagram += `  class ${func} {\n`
        diagram += `    +execute()\n`

        // Add methods based on code content
        if (code.includes("if") || code.includes("else")) {
          diagram += `    +checkCondition()\n`
        }

        if (code.includes("for") || code.includes("while")) {
          diagram += `    +iterate()\n`
        }

        diagram += `  }\n`

        // Add relationship
        diagram += `  Program --> ${func}\n`
      })
    }

    return diagram
  } catch (error) {
    console.error("Error generating enhanced class diagram:", error)
    return `classDiagram
  class Main {
    +execute()
  }
  class Helper {
    +process()
  }
  Main --> Helper`
  }
}

// Helper functions for code analysis

function extractFunctions(code: string, language: string): string[] {
  const functions: string[] = []

  try {
    let regex: RegExp

    if (language === "javascript" || language === "typescript") {
      regex =
        /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function|const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*$$|class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*$$\s*{/g

      let match
      while ((match = regex.exec(code)) !== null) {
        const funcName = match[1] || match[2] || match[3] || match[4] || match[5]
        if (funcName && !functions.includes(funcName)) {
          functions.push(funcName)
        }
      }
    } else if (language === "python") {
      regex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(|class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g

      let match
      while ((match = regex.exec(code)) !== null) {
        const funcName = match[1] || match[2]
        if (funcName && !functions.includes(funcName)) {
          functions.push(funcName)
        }
      }
    } else if (language === "java" || language === "csharp") {
      regex =
        /(public|private|protected|static|\s) +[\w<>[\]]+\s+(\w+) *$$[^)]*$$ *(\{?|[^;])|class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g

      let match
      while ((match = regex.exec(code)) !== null) {
        const funcName = match[2] || match[4]
        if (funcName && !functions.includes(funcName)) {
          functions.push(funcName)
        }
      }
    }

    // If no functions found, add a placeholder
    if (functions.length === 0) {
      functions.push("main")
    }
  } catch (error) {
    console.error("Error extracting functions:", error)
    functions.push("main") // Fallback
  }

  return functions
}

function extractClasses(code: string, language: string): string[] {
  const classes: string[] = []

  try {
    let regex: RegExp

    if (language === "javascript" || language === "typescript") {
      regex = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g

      let match
      while ((match = regex.exec(code)) !== null) {
        if (match[1] && !classes.includes(match[1])) {
          classes.push(match[1])
        }
      }
    } else if (language === "python") {
      regex = /class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g

      let match
      while ((match = regex.exec(code)) !== null) {
        if (match[1] && !classes.includes(match[1])) {
          classes.push(match[1])
        }
      }
    } else if (language === "java" || language === "csharp") {
      regex = /class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g

      let match
      while ((match = regex.exec(code)) !== null) {
        if (match[1] && !classes.includes(match[1])) {
          classes.push(match[1])
        }
      }
    }
  } catch (error) {
    console.error("Error extracting classes:", error)
  }

  return classes
}

function extractClassMethods(code: string, className: string, language: string): string[] {
  const methods: string[] = []

  try {
    // Find the class definition
    const classRegex = new RegExp(`class\\s+${className}\\s*{([^}]*)}`, "s")
    const classMatch = classRegex.exec(code)

    if (classMatch && classMatch[1]) {
      const classBody = classMatch[1]

      let methodRegex: RegExp

      if (language === "javascript" || language === "typescript") {
        methodRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*$$[^)]*$$\s*{/g

        let match
        while ((match = methodRegex.exec(classBody)) !== null) {
          if (match[1] && !methods.includes(match[1]) && match[1] !== "constructor") {
            methods.push(match[1])
          }
        }
      } else if (language === "python") {
        methodRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g

        let match
        while ((match = methodRegex.exec(classBody)) !== null) {
          if (match[1] && !methods.includes(match[1]) && match[1] !== "__init__") {
            methods.push(match[1])
          }
        }
      } else if (language === "java" || language === "csharp") {
        methodRegex = /(public|private|protected|static|\s) +[\w<>[\]]+\s+(\w+) *$$[^)]*$$ *(\{?|[^;])/g

        let match
        while ((match = methodRegex.exec(classBody)) !== null) {
          if (match[2] && !methods.includes(match[2])) {
            methods.push(match[2])
          }
        }
      }
    }

    // If no methods found, add a placeholder
    if (methods.length === 0) {
      methods.push("execute")
    }
  } catch (error) {
    console.error("Error extracting class methods:", error)
    methods.push("execute") // Fallback
  }

  return methods
}

function extractControlStructures(code: string, language: string): Array<{ type: string; name: string }> {
  const structures: Array<{ type: string; name: string }> = []

  try {
    // Extract if statements
    let ifRegex: RegExp

    if (language === "javascript" || language === "typescript" || language === "java" || language === "csharp") {
      ifRegex = /if\s*$$([^)]*)$$/g

      let match
      while ((match = ifRegex.exec(code)) !== null) {
        if (match[1]) {
          structures.push({
            type: "if",
            name: match[1].length > 20 ? match[1].substring(0, 20) + "..." : match[1],
          })
        }
      }
    } else if (language === "python") {
      ifRegex = /if\s+([^:]*)/g

      let match
      while ((match = ifRegex.exec(code)) !== null) {
        if (match[1]) {
          structures.push({
            type: "if",
            name: match[1].length > 20 ? match[1].substring(0, 20) + "..." : match[1],
          })
        }
      }
    }

    // Extract loops
    let loopRegex: RegExp

    if (language === "javascript" || language === "typescript" || language === "java" || language === "csharp") {
      loopRegex = /(for|while)\s*$$([^)]*)$$/g

      let match
      while ((match = loopRegex.exec(code)) !== null) {
        if (match[2]) {
          structures.push({
            type: "loop",
            name: `${match[1]}: ${match[2].length > 15 ? match[2].substring(0, 15) + "..." : match[2]}`,
          })
        }
      }
    } else if (language === "python") {
      loopRegex = /(for|while)\s+([^:]*)/g

      let match
      while ((match = loopRegex.exec(code)) !== null) {
        if (match[2]) {
          structures.push({
            type: "loop",
            name: `${match[1]}: ${match[2].length > 15 ? match[2].substring(0, 15) + "..." : match[2]}`,
          })
        }
      }
    }
  } catch (error) {
    console.error("Error extracting control structures:", error)
  }

  return structures
}

// Get a basic diagram based on type
function getBasicDiagram(diagramType: string): string {
  switch (diagramType) {
    case "sequence":
      return `sequenceDiagram
  participant User
  participant System
  User->>System: Execute Code
  System->>User: Return Result`
    case "class":
      return `classDiagram
  class Main {
    +execute()
  }
  class Helper {
    +process()
  }
  Main --> Helper`
    default:
      return `graph TD
  A[Start] --> B[Process Code]
  B --> C[End]`
  }
}
