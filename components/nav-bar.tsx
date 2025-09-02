"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Settings, GitBranch } from "lucide-react"

export function NavBar() {
  // Temporarily disable pathname to fix import error
  const pathname = "/"

  return (
    <div className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-4 flex items-center">
          <GitBranch className="h-6 w-6 mr-2" />
          <Link href="/" className="text-xl font-bold">
            Code2Diagram
          </Link>
        </div>
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/"
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          {/* <Link
            href="/settings"
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              pathname === "/settings" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Link> */}
          
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <GitBranch className="h-4 w-4 mr-1" />
            GitHub
          </Button>
        </div>
      </div>
    </div>
  )
}
