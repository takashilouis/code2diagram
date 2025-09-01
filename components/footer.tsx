"use client"

import { Heart, Github, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-12">
      <div className="container mx-auto px-4 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-lg mb-2">CodeXFlow</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-md">
              Transform your ideas and code into beautiful, interactive diagrams using the power of Google Gemini AI. 
              Create flowcharts, sequence diagrams, and visualize your logic effortlessly.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>by developers, for developers</span>
            </div>
          </div>

          {/* Features section */}
          <div>
            <h4 className="font-semibold mb-3">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Code to Flowchart</li>
              <li>Ideas to Sequence Diagram</li>
              <li>AI-Powered Analysis</li>
              <li>Interactive Diagrams</li>
              <li>Diagram History</li>
              <li>Dark/Light Mode</li>
            </ul>
          </div>

          {/* Technology section */}
          <div>
            <h4 className="font-semibold mb-3">Built With</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Next.js 15</li>
              <li>React 19</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Google Gemini AI</li>
              <li>D3.js</li>
            </ul>
          </div>
        </div>

        {/* Social links and copyright */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © {currentYear} CodeXFlow. All rights reserved.
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Powered by Google Gemini AI • Open source and free to use • 
              <a href="#" className="hover:text-foreground transition-colors ml-1">Privacy Policy</a> • 
              <a href="#" className="hover:text-foreground transition-colors ml-1">Terms of Service</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
