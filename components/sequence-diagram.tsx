"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface FlowNode {
  id: string
  type: string
  data: {
    label: string
  }
}

interface FlowEdge {
  id: string
  source: string
  target: string
  label?: string
}

interface FlowData {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

interface SequenceDiagramProps {
  data: FlowData | null
  theme?: "light" | "dark"
}

export function SequenceDiagram({ data, theme = "dark" }: SequenceDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!data || !svgRef.current) {
      console.log('SequenceDiagram: Missing data or SVG ref', { 
        dataExists: !!data, 
        svgRefExists: !!svgRef.current 
      });
      return;
    }

    console.log('SequenceDiagram: Rendering diagram', { 
      nodeCount: data.nodes.length, 
      edgeCount: data.edges.length 
    });

    try {
      // Clear previous renders
      const svg = d3.select(svgRef.current)
      svg.selectAll("*").remove()
      
      // Set dimensions
      const margin = { top: 50, right: 50, bottom: 50, left: 50 }
      
      // Set fixed width based on container size or default to 800
      const containerWidth = containerRef.current?.clientWidth || 800
      svg.attr('width', containerWidth)
      
      // Calculate height based on number of messages (minimum 600px)
      const estimatedHeight = Math.max(600, 200 + (data.edges.length * 50))
      svg.attr('height', estimatedHeight)
      
      const width = containerWidth - margin.left - margin.right
      const height = estimatedHeight - margin.top - margin.bottom
      
      // Create main container group
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
      
      // Sort nodes by type to ensure consistent ordering
      const nodeTypeOrder: Record<string, number> = {
        "actor": 0,
        "system": 1,
        "component": 2,
        "database": 3,
        "external": 4
      }
      
      const sortedNodes = [...data.nodes].sort((a, b) => {
        // First sort by type
        const typeOrderA = nodeTypeOrder[a.type] !== undefined ? nodeTypeOrder[a.type] : 999
        const typeOrderB = nodeTypeOrder[b.type] !== undefined ? nodeTypeOrder[b.type] : 999
        
        if (typeOrderA !== typeOrderB) {
          return typeOrderA - typeOrderB
        }
        
        // If same type, sort alphabetically by label
        return a.data.label.localeCompare(b.data.label)
      })
      
      // Calculate dynamic box widths based on text content
      const getTextWidth = (text: string, fontSize: number = 14) => {
        // Create a temporary text element to measure text width
        const tempText = g.append("text")
          .style("font-family", "Arial, sans-serif")
          .style("font-size", `${fontSize}px`)
          .style("font-weight", "bold")
          .text(text)
        const textWidth = (tempText.node() as SVGTextElement)?.getBBox().width || 0
        tempText.remove()
        return textWidth
      }

      // Calculate minimum width needed for each participant
      const minWidths = sortedNodes.map(node => 
        Math.max(120, getTextWidth(node.data.label) + 40) // minimum 120px, text width + 40px padding
      )
      
      // Calculate total width needed
      const totalMinWidth = minWidths.reduce((sum, width) => sum + width, 0)
      const availableWidth = width - (sortedNodes.length * 20) // 20px spacing between boxes
      
      // Scale widths proportionally if needed
      const scaleFactor = availableWidth < totalMinWidth ? availableWidth / totalMinWidth : 1
      const boxWidths = minWidths.map(w => w * scaleFactor)
      
      // Calculate x positions
      const boxPositions = boxWidths.reduce((positions, width, index) => {
        const prevX = index === 0 ? 0 : positions[index - 1].x + positions[index - 1].width + 20
        positions.push({ x: prevX, width })
        return positions
      }, [] as Array<{ x: number, width: number }>)
      
      // Draw participant boxes at the top
      const participantBoxes = g.selectAll(".participant-box")
        .data(sortedNodes)
        .enter()
        .append("g")
        .attr("class", "participant")
        .attr("transform", (d: FlowNode, i: number) => `translate(${boxPositions[i].x}, 0)`)
      
      // Add participant rectangles
      participantBoxes.append("rect")
        .attr("width", (d: FlowNode, i: number) => boxWidths[i])
        .attr("height", 50)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", theme === "dark" ? "#2D333B" : "#f5f5f5")
        .attr("stroke", theme === "dark" ? "#8b949e" : "#ccc")
        .attr("stroke-width", 1.5)
      
      // Add participant labels
      participantBoxes.append("text")
        .attr("x", (d: FlowNode, i: number) => boxWidths[i] / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("fill", theme === "dark" ? "#fff" : "#333")
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text((d: FlowNode) => d.data.label)
      
      // Draw lifelines (vertical dashed lines)
      participantBoxes.append("line")
        .attr("x1", (d: FlowNode, i: number) => boxWidths[i] / 2)
        .attr("y1", 50) // Start from bottom of participant box
        .attr("x2", (d: FlowNode, i: number) => boxWidths[i] / 2)
        .attr("y2", height - 50) // Leave space at bottom for participant boxes
        .attr("stroke", theme === "dark" ? "#8b949e" : "#ccc")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,4")
      
      // Create a map of node id to column index for easier reference
      const nodePositions: Record<string, { x: number, index: number }> = {}
      sortedNodes.forEach((node, index) => {
        nodePositions[node.id] = {
          x: boxPositions[index].x + (boxWidths[index] / 2),
          index
        }
      })
      
      // Group edges by source-target pairs to handle multiple messages between same participants
      const edgeGroups: Record<string, FlowEdge[]> = {}
      data.edges.forEach(edge => {
        const key = `${edge.source}-${edge.target}`
        if (!edgeGroups[key]) {
          edgeGroups[key] = []
        }
        edgeGroups[key].push(edge)
      })
      
      // Sort edges to determine vertical ordering
      const sortedEdges = [...data.edges].sort((a, b) => {
        // Sort by edge id if it contains numbers that can be used for ordering
        const aNum = parseInt(a.id.replace(/[^0-9]/g, ''))
        const bNum = parseInt(b.id.replace(/[^0-9]/g, ''))
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum
        }
        return a.id.localeCompare(b.id)
      })
      
      // Calculate vertical spacing
      const messageSpacing = (height - 150) / (sortedEdges.length + 1)
      
      // Draw the messages (arrows)
      sortedEdges.forEach((edge, index) => {
        const sourcePos = nodePositions[edge.source]
        const targetPos = nodePositions[edge.target]
        
        if (!sourcePos || !targetPos) {
          console.error(`Missing position for edge ${edge.id} (${edge.source} -> ${edge.target})`)
          return
        }
        
        const y = 80 + (index + 1) * messageSpacing
        const arrowGroup = g.append("g").attr("class", "message")
        
        // Draw the arrow line
        arrowGroup.append("line")
          .attr("x1", sourcePos.x)
          .attr("y1", y)
          .attr("x2", targetPos.x)
          .attr("y2", y)
          .attr("stroke", theme === "dark" ? "#8b949e" : "#666")
          .attr("stroke-width", 1.5)
        
        // Add arrowhead
        const arrowDirection = sourcePos.index < targetPos.index ? 1 : -1
        const arrowSize = 6
        
        arrowGroup.append("polygon")
          .attr("points", `0,0 -${arrowSize},${arrowSize} -${arrowSize},-${arrowSize}`)
          .attr("transform", `translate(${targetPos.x - (arrowDirection * 1)}, ${y}) scale(${arrowDirection}, 1)`)
          .attr("fill", theme === "dark" ? "#8b949e" : "#666")
        
        // Add message label with better text handling
        arrowGroup.append("text")
          .attr("x", (sourcePos.x + targetPos.x) / 2)
          .attr("y", y - 10)
          .attr("text-anchor", "middle")
          .attr("fill", theme === "dark" ? "#fff" : "#333")
          .style("font-family", "Arial, sans-serif")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .each(function(this: SVGTextElement) {
            const text = d3.select(this);
            const maxWidth = Math.abs(targetPos.x - sourcePos.x) - 20;
            
            // If the text is too long, truncate it with ellipsis
            let textLength = this.getComputedTextLength();
            if (textLength > maxWidth) {
              let textContent = text.text();
              while (textLength > maxWidth && textContent.length > 0) {
                textContent = textContent.slice(0, -1);
                text.text(textContent + '...');
                textLength = this.getComputedTextLength();
                if (textLength <= maxWidth) break;
              }
            }
          })
          .text(edge.label || "")
      })
      
      // Add participant boxes at the bottom (repeat of top)
      const bottomParticipantBoxes = g.selectAll(".bottom-participant-box")
        .data(sortedNodes)
        .enter()
        .append("g")
        .attr("class", "bottom-participant")
        .attr("transform", (d: FlowNode, i: number) => `translate(${boxPositions[i].x}, ${height - 50})`)
      
      bottomParticipantBoxes.append("rect")
        .attr("width", (d: FlowNode, i: number) => boxWidths[i])
        .attr("height", 50)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", theme === "dark" ? "#2D333B" : "#f5f5f5")
        .attr("stroke", theme === "dark" ? "#8b949e" : "#ccc")
        .attr("stroke-width", 1.5)
      
      bottomParticipantBoxes.append("text")
        .attr("x", (d: FlowNode, i: number) => boxWidths[i] / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("fill", theme === "dark" ? "#fff" : "#333")
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text((d: FlowNode) => d.data.label)
      
      // Add alt fragment (conditional blocks)
      // Look for edges that might be part of conditional blocks
      interface AltFragment {
        startIndex: number;
        endIndex?: number;
        elseIndex?: number; // For marking where the 'else' condition starts
        label: string;
        condition: string;
        edges: FlowEdge[];
      }
      
      // Dynamically detect alt fragments from edge labels
      const altFragments: AltFragment[] = []
      let currentAlt: AltFragment | null = null
      let altCounter = 0
      
      // Look for conditional markers in edge labels (typically in brackets)
      sortedEdges.forEach((edge, index) => {
        if (!edge.label) return
        
        // Check if this edge has a label that indicates the start of a conditional block
        // Look for patterns like [Condition], [If something], [Alt: something]
        const conditionMatch = edge.label.match(/\[(.*?)\]/) 
        
        if (conditionMatch) {
          const conditionText = conditionMatch[1].trim()
          
          // If we're already in an alt block, close it before starting a new one
          if (currentAlt) {
            currentAlt.endIndex = index - 1
            currentAlt = null
          }
          
          // Start a new alt fragment
          currentAlt = {
            startIndex: index,
            label: 'alt',
            condition: conditionText,
            edges: [edge]
          }
          altFragments.push(currentAlt)
          altCounter++
        } 
        // Check if this might be an 'else' condition
        else if (currentAlt && edge.label.toLowerCase().includes('else')) {
          currentAlt.elseIndex = index
        }
        // Add this edge to the current alt fragment if we're in one
        else if (currentAlt) {
          currentAlt.edges.push(edge)
        }
      })
      
      // Close any open alt fragment
      if (currentAlt && typeof currentAlt.endIndex === 'undefined') {
        currentAlt.endIndex = sortedEdges.length - 1
      }
      
      // Draw alt fragments (if any)
      altFragments.forEach((fragment, fragIndex) => {
        // For fragments without an explicit end, assume they end at the next fragment or at the end
        if (fragment.endIndex === undefined) {
          const nextFragment = altFragments[fragIndex + 1]
          fragment.endIndex = (nextFragment?.startIndex ?? sortedEdges.length) - 1
        }
        
        // Calculate the y-coordinates for the fragment
        const startY = 80 + (fragment.startIndex + 1) * messageSpacing - 30
        const endY = 80 + (fragment.endIndex + 1) * messageSpacing + 30
        const height = endY - startY
        
        // Calculate the x-coordinates for the fragment
        // We want it to span all participants involved in the fragment's edges
        let minX = width
        let maxX = 0
        
        // Find all edges that are part of this fragment
        const fragmentEdges = sortedEdges.slice(
          fragment.startIndex, 
          fragment.endIndex !== undefined ? fragment.endIndex + 1 : undefined
        )
        
        fragmentEdges.forEach(edge => {
          const sourcePos = nodePositions[edge.source]
          const targetPos = nodePositions[edge.target]
          
          if (sourcePos && targetPos) {
            minX = Math.min(minX, sourcePos.x, targetPos.x)
            maxX = Math.max(maxX, sourcePos.x, targetPos.x)
          }
        })
        
        // Add some padding (use a reasonable default if columnWidth is not available)
        const paddingAmount = boxWidths.length > 0 ? boxWidths[0] * 0.3 : 50
        minX -= paddingAmount
        maxX += paddingAmount
        
        // Create the fragment container
        const fragmentGroup = g.append("g")
          .attr("class", "fragment")
        
        // Draw the fragment box
        fragmentGroup.append("rect")
          .attr("x", minX)
          .attr("y", startY)
          .attr("width", maxX - minX)
          .attr("height", height)
          .attr("fill", theme === "dark" ? "rgba(45, 51, 59, 0.6)" : "rgba(245, 245, 245, 0.6)")
          .attr("stroke", theme === "dark" ? "#8b949e" : "#ccc")
          .attr("stroke-width", 1.5)
          .attr("rx", 4)
          .attr("ry", 4)
        
        // Add the fragment label (alt, opt, loop, etc.)
        fragmentGroup.append("rect")
          .attr("x", minX)
          .attr("y", startY)
          .attr("width", 40)
          .attr("height", 20)
          .attr("fill", theme === "dark" ? "#2D333B" : "#f5f5f5")
          .attr("stroke", theme === "dark" ? "#8b949e" : "#ccc")
          .attr("stroke-width", 1.5)
        
        fragmentGroup.append("text")
          .attr("x", minX + 20)
          .attr("y", startY + 14)
          .attr("text-anchor", "middle")
          .attr("fill", theme === "dark" ? "#fff" : "#333")
          .style("font-family", "Arial, sans-serif")
          .style("font-size", "10px")
          .style("font-weight", "bold")
          .text(fragment.label)
        
        // Add the condition text
        fragmentGroup.append("text")
          .attr("x", minX + 50)
          .attr("y", startY + 14)
          .attr("fill", theme === "dark" ? "#fff" : "#333")
          .style("font-family", "Arial, sans-serif")
          .style("font-size", "10px")
          .style("font-style", "italic")
          .text(fragment.condition)
        
        // Add a dividing line if this fragment has an else condition
        if (fragment.elseIndex !== undefined) {
          const elseY = 80 + (fragment.elseIndex + 0.5) * messageSpacing
          
          fragmentGroup.append("line")
            .attr("x1", minX)
            .attr("y1", elseY)
            .attr("x2", maxX)
            .attr("y2", elseY)
            .attr("stroke", theme === "dark" ? "#8b949e" : "#ccc")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4,4")
            
          fragmentGroup.append("text")
            .attr("x", minX + 50)
            .attr("y", elseY - 5)
            .attr("fill", theme === "dark" ? "#fff" : "#333")
            .style("font-family", "Arial, sans-serif")
            .style("font-size", "10px")
            .style("font-style", "italic")
            .text("else")
        }
      })
      
      // Make the diagram fit within the SVG
      const actualWidth = containerRef.current?.clientWidth || 800
      const actualHeight = Math.max(600, 200 + (data.edges.length * 50))
      
      svg.attr("width", actualWidth)
         .attr("height", actualHeight)
      
      // Add CSS for interactions
      const style = document.createElement('style')
      style.textContent = `
        .sequence-diagram svg {
          background-color: ${theme === 'dark' ? '#0d1117' : '#ffffff'};
          border-radius: 8px;
        }
        .sequence-diagram .participant:hover rect,
        .sequence-diagram .bottom-participant:hover rect {
          stroke: ${theme === 'dark' ? '#58A6FF' : '#0969da'};
          stroke-width: 2px;
        }
        .sequence-diagram .message:hover line {
          stroke: ${theme === 'dark' ? '#58A6FF' : '#0969da'};
          stroke-width: 2px;
        }
        .sequence-diagram .message:hover polygon {
          fill: ${theme === 'dark' ? '#58A6FF' : '#0969da'};
        }
        .sequence-diagram .message:hover text {
          fill: ${theme === 'dark' ? '#58A6FF' : '#0969da'};
          font-weight: bold;
        }
      `
      document.head.appendChild(style)
      
      // Return cleanup function
      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style)
        }
      }
    } catch (error) {
      console.error("Error rendering sequence diagram:", error)
      
      // Display error message in the SVG
      if (svgRef.current) {
        const svg = d3.select(svgRef.current)
        svg.selectAll('*').remove()
        
        svg.append('text')
          .attr('x', '50%')
          .attr('y', '50%')
          .attr('text-anchor', 'middle')
          .attr('fill', 'red')
          .text(`Error rendering diagram: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      
      // Return empty cleanup function
      return () => {}
    }
  }, [data, theme])

  // Add a fallback message if no diagram is available
  if (!data) {
    return (
      <div className="sequence-diagram" ref={containerRef}>
        <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-md">
          <p className="text-gray-500 dark:text-gray-400">No sequence diagram data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sequence-diagram w-full h-full" ref={containerRef}>
      <svg 
        ref={svgRef} 
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}
