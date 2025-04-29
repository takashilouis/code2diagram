"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import dagreD3 from "dagre-d3"

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

interface JsonFlowchartProps {
  data: FlowData | null
  theme?: "light" | "dark"
}

export function JsonFlowchart({ data, theme = "dark" }: JsonFlowchartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!data || !svgRef.current) {
      console.log('JsonFlowchart: Missing data or SVG ref', { 
        dataExists: !!data, 
        svgRefExists: !!svgRef.current 
      });
      return;
    }

    console.log('JsonFlowchart: Rendering flowchart', { 
      nodeCount: data.nodes.length, 
      edgeCount: data.edges.length 
    });

    try {
      // Clear previous renders
      const svg = d3.select(svgRef.current)
      svg.selectAll("*").remove()
      
      // Set up a new graph
      const g = new dagreD3.graphlib.Graph().setGraph({
        rankdir: 'TB',
        marginx: 20,
        marginy: 20,
        nodesep: 70,
        edgesep: 25,
        ranksep: 50,
        acyclicer: 'greedy',
      })
      
      // Add nodes to the graph
      data.nodes.forEach(node => {
        // Use only shapes supported by dagre-d3
        let shape = 'rect'
        let style = ''
        
        switch(node.type) {
          case 'start':
          case 'end':
            // Use rect with rounded corners
            shape = 'rect'
            style = 'fill: #263C59; stroke: #58A6FF; rx: 20px; ry: 20px;' // GitHub blue accent
            break
          case 'decision':
            shape = 'diamond'
            style = 'fill: #2D333B; stroke: #FFCA28;' // Yellow accent
            break
          case 'io':
            // Use rect for IO nodes
            shape = 'rect'
            style = 'fill: #2D333B; stroke: #7CE38B;' // Green accent
            break
          default:
            style = 'fill: #2D333B; stroke: #A371F7;' // Purple accent
        }
        
        g.setNode(node.id, {
          label: node.data.label,
          shape: shape,
          style: style,
          rx: node.type === 'start' || node.type === 'end' ? 15 : 5,
          ry: node.type === 'start' || node.type === 'end' ? 15 : 5,
          class: `node-${node.type}`
        })
      })
      
      // Add edges to the graph
      data.edges.forEach(edge => {
        // Determine if this is a 'Yes' edge from a decision node
        const sourceNode = data.nodes.find(n => n.id === edge.source);
        const isDecisionYesEdge = sourceNode?.type === 'decision' && edge.label === 'Yes';
        
        g.setEdge(edge.source, edge.target, {
          label: edge.label || '',
          style: isDecisionYesEdge 
            ? 'stroke: #58A6FF; stroke-width: 2.5px;' // Highlight 'Yes' paths from decision nodes
            : edge.label === 'Yes' 
              ? 'stroke: #7CE38B; stroke-width: 2px;' // Other 'Yes' paths
              : edge.label === 'No' 
                ? 'stroke: #E06C75; stroke-width: 2px;' // 'No' paths
                : 'stroke: #8b949e; stroke-width: 1.5px;', // Default
          arrowheadStyle: isDecisionYesEdge 
            ? 'fill: #58A6FF;' 
            : edge.label === 'Yes' 
              ? 'fill: #7CE38B;' 
              : edge.label === 'No' 
                ? 'fill: #E06C75;' 
                : 'fill: #8b949e;',
          curve: d3.curveBasis,
          labelStyle: 'font-weight: bold; font-size: 14px;'
        })
      })
      
      // Create the inner group for the graph
      const inner = svg.append('g')
      
      // Create the renderer
      const render = new dagreD3.render()
      
      // Run the renderer
      // @ts-ignore - Type issues with d3 and dagre-d3
      render(inner, g)
      
      // Center the graph
      const svgWidth = parseInt(svg.attr('width') || '800', 10)
      const svgHeight = parseInt(svg.attr('height') || '600', 10)
      const graphWidth = g.graph().width || 0
      const graphHeight = g.graph().height || 0
      
      const xCenterOffset = Math.max(0, (svgWidth - graphWidth) / 2)
      const yCenterOffset = Math.max(0, (svgHeight - graphHeight) / 2)
      
      inner.attr('transform', `translate(${xCenterOffset}, ${yCenterOffset})`)
      
      // Fit the SVG to the graph
      const fitDiagram = () => {
        // Get actual graph dimensions
        const graphWidth = g.graph().width || 800
        const graphHeight = g.graph().height || 600
        
        // Set minimum dimensions
        svg.attr('width', Math.max(graphWidth + 80, 800).toString())
           .attr('height', Math.max(graphHeight + 80, 600).toString())
        
        // Auto-fit with initial zoom that shows the whole diagram
        const svgWidth = parseInt(svg.attr('width') || '800', 10)
        const containerWidth = containerRef.current?.clientWidth || svgWidth
        
        // Calculate zoom level to fit diagram properly
        const widthRatio = (containerWidth - 30) / svgWidth
        const initialScale = Math.min(widthRatio, 1) // Don't zoom in, only out if needed
        
        // Create a new transform object for initial positioning
        const initialTranslateX = (containerWidth - (svgWidth * initialScale)) / 2
        
        return {
          k: initialScale,
          x: initialTranslateX,
          y: 20 // Add a little padding at the top
        }
      }
      
      // Apply the fit function
      const initialTransform = fitDiagram()
      
      // Configure zoom
      const zoomHandler = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 2]) // Allow zooming out to 10% and in to 200%
        .on('zoom', function(event) {
          inner.attr('transform', event.transform.toString())
        })
      
      // Initialize with calculated transform
      const zoomIdentity = d3.zoomIdentity
        .translate(initialTransform.x || 0, initialTransform.y || 0)
        .scale(initialTransform.k || 1)
        
      svg.call(zoomHandler.transform, zoomIdentity)
      
      // Then call the zoom handler
      svg.call(zoomHandler)
      
      // Add CSS styles for the diagram
      const style = document.createElement('style')
      style.textContent = `
        .json-flowchart svg {
          background-color: ${theme === 'dark' ? '#0d1117' : '#ffffff'};
          border-radius: 8px;
        }
        .json-flowchart .node rect,
        .json-flowchart .node circle,
        .json-flowchart .node ellipse,
        .json-flowchart .node polygon {
          stroke-width: 2px;
        }
        .json-flowchart .node text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 14px;
          fill: ${theme === 'dark' ? '#fff' : '#333'};
          font-weight: 500;
        }
        .json-flowchart .edgePath path {
          stroke-width: 2px;
        }
        .json-flowchart .edgeLabel text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 14px;
          font-weight: bold;
          fill: ${theme === 'dark' ? '#fff' : '#333'};
          background-color: ${theme === 'dark' ? 'rgba(45, 51, 59, 0.8)' : 'rgba(245, 245, 245, 0.9)'};
          padding: 4px 8px;
          border-radius: 4px;
        }
        .json-flowchart .edgeLabel rect {
          fill: ${theme === 'dark' ? 'rgba(45, 51, 59, 0.8)' : 'rgba(245, 245, 245, 0.9)'};
          rx: 4px;
          ry: 4px;
        }
        
        /* Highlight Yes/No labels with different colors */
        .json-flowchart .edgeLabel.yes-label text {
          fill: ${theme === 'dark' ? '#7CE38B' : '#22863a'};
        }
        
        .json-flowchart .edgeLabel.no-label text {
          fill: ${theme === 'dark' ? '#E06C75' : '#d73a49'};
        }
      `
      document.head.appendChild(style)
      
      return () => {
        // Clean up
        if (document.head.contains(style)) {
          document.head.removeChild(style)
        }
      }
    } catch (error) {
      console.error("Error rendering JSON flowchart:", error)
      
      // Display error message in the SVG
      if (svgRef.current) {
        const svg = d3.select(svgRef.current)
        svg.selectAll('*').remove()
        
        svg.append('text')
          .attr('x', '50%')
          .attr('y', '50%')
          .attr('text-anchor', 'middle')
          .attr('fill', 'red')
          .text(`Error rendering flowchart: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }, [data, theme])

  // Add a fallback message if no diagram is available
  if (!data) {
    return (
      <div className="json-flowchart" ref={containerRef}>
        <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-md">
          <p className="text-gray-500 dark:text-gray-400">No flowchart data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="json-flowchart" ref={containerRef}>
      <svg 
        ref={svgRef} 
        width="100%" 
        height="600"
        className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
        style={{ border: '1px solid #333', borderRadius: '4px' }}
      ></svg>
    </div>
  )
}
