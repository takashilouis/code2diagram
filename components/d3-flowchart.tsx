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
  source: string
  target: string
  label?: string
}

interface FlowData {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

interface D3FlowchartProps {
  diagram: string | null
  diagramType: string
}

export function D3Flowchart({ diagram, diagramType }: D3FlowchartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!diagram || !svgRef.current) {
      console.log('D3Flowchart: Missing diagram or SVG ref', { diagram: !!diagram, svgRef: !!svgRef.current });
      return;
    }

    console.log('D3Flowchart: Rendering diagram', { diagramType, diagramLength: diagram.length });
    console.log('D3Flowchart: First 100 chars of diagram:', diagram.substring(0, 100));

    try {
      // Parse the diagram string into a flowData object
      const flowData = parseMermaidToFlowData(diagram)
      console.log('D3Flowchart: Parsed flowData:', { 
        nodeCount: flowData.nodes.length, 
        edgeCount: flowData.edges.length 
      });
    
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
      flowData.nodes.forEach(node => {
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
      flowData.edges.forEach(edge => {
        g.setEdge(edge.source, edge.target, {
          label: edge.label || '',
          style: 'stroke: #8b949e; stroke-width: 1.5px;',
          arrowheadStyle: 'fill: #8b949e;',
          curve: d3.curveBasis
        })
      })
    
      // Create the inner group for the graph
      const inner = svg.append('g')
      console.log('Created SVG and inner group')
      
      // Create the renderer
      const render = new dagreD3.render()
      
      // Run the renderer
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
        .d3-flowchart svg {
          background-color: #fff;
          border-radius: 8px;
        }
        .d3-flowchart .node rect,
        .d3-flowchart .node circle,
        .d3-flowchart .node ellipse,
        .d3-flowchart .node polygon {
          stroke-width: 2px;
        }
        .d3-flowchart .node text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 14px;
          fill: #fff;
          font-weight: 500;
        }
        .d3-flowchart .edgePath path {
          stroke-width: 2px;
        }
        .d3-flowchart .edgeLabel text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 12px;
          fill: #fff;
          background-color: #2D333B;
          padding: 2px 4px;
          border-radius: 4px;
        }
        .d3-flowchart .edgeLabel rect {
          fill: #2D333B;
        }
        .dark .d3-flowchart svg {
          background-color: #0d1117;
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
      console.error("Error rendering D3 diagram:", error)
      
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
    }
  }, [diagram, diagramType]);

  // Function to parse Mermaid diagram string into flowData
  function parseMermaidToFlowData(mermaidString: string): FlowData {
    console.log('Parsing Mermaid string:', mermaidString.substring(0, 100));
    
    // Ensure we have a valid Mermaid string
    if (!mermaidString || !mermaidString.includes('graph')) {
      console.error('Invalid Mermaid string format');
      return { nodes: [], edges: [] };
    }
    
    const lines = mermaidString.split('\n').filter(line => line.trim() !== '')
    console.log('Parsed lines:', lines.length);
    
    const nodes: FlowNode[] = []
    const edges: FlowEdge[] = []
    
    // Skip the first line which is usually "graph TD" or similar
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (line.includes('-->')) {
        // This is an edge
        const parts = line.split('-->')
        
        if (parts.length >= 2) {
          let source = parts[0].trim()
          let target = parts[1].trim()
          let label = ''
          
          // Check if there's a label in the format |label|
          if (target.includes('|')) {
            const labelParts = target.split('|')
            if (labelParts.length >= 3) {
              label = labelParts[1].trim()
              target = labelParts[2].trim()
            } else if (labelParts.length === 2) {
              target = labelParts[1].trim()
            }
          }
          
          // Extract node IDs from potential brackets or braces
          source = extractNodeId(source)
          target = extractNodeId(target)
          
          // Add nodes if they don't exist
          if (!nodes.some(n => n.id === source)) {
            nodes.push({
              id: source,
              type: source.toLowerCase().includes('start') ? 'start' : 
                    source.toLowerCase().includes('end') ? 'end' : 'process',
              data: { label: extractNodeLabel(parts[0].trim()) }
            })
          }
          
          if (!nodes.some(n => n.id === target)) {
            nodes.push({
              id: target,
              type: target.toLowerCase().includes('start') ? 'start' : 
                    target.toLowerCase().includes('end') ? 'end' : 'process',
              data: { label: extractNodeLabel(parts[1].trim()) }
            })
          }
          
          // Add the edge
          edges.push({
            source,
            target,
            label
          })
        }
      } else if (line.includes('[') && line.includes(']')) {
        // This is a node definition
        const nodeMatch = line.match(/(\w+)\s*\[(.*?)\]/)
        if (nodeMatch && nodeMatch.length >= 3) {
          const id = nodeMatch[1].trim()
          const label = nodeMatch[2].trim()
          
          // Determine node type
          let type = 'process'
          if (label.toLowerCase().includes('start')) {
            type = 'start'
          } else if (label.toLowerCase().includes('end')) {
            type = 'end'
          } else if (line.includes('{') && line.includes('}')) {
            type = 'decision'
          }
          
          // Add the node if it doesn't exist
          if (!nodes.some(n => n.id === id)) {
            nodes.push({
              id,
              type,
              data: { label }
            })
          }
        }
      }
    }
    
    return { nodes, edges }
  }
  
  // Helper function to extract node ID from Mermaid syntax
  function extractNodeId(nodeStr: string): string {
    // Remove any whitespace
    nodeStr = nodeStr.trim()
    
    // If it's a simple ID without brackets
    if (!nodeStr.includes('[') && !nodeStr.includes('{')) {
      return nodeStr
    }
    
    // Extract ID before brackets or braces
    const idMatch = nodeStr.match(/^(\w+)/)
    if (idMatch && idMatch.length > 1) {
      return idMatch[1]
    }
    
    // Fallback: use the whole string as ID
    return nodeStr
  }
  
  // Helper function to extract node label from Mermaid syntax
  function extractNodeLabel(nodeStr: string): string {
    // Check for label in brackets
    const labelMatch = nodeStr.match(/\[(.*?)\]/)
    if (labelMatch && labelMatch.length > 1) {
      return labelMatch[1]
    }
    
    // Check for label in braces (for decision nodes)
    const decisionMatch = nodeStr.match(/\{(.*?)\}/)
    if (decisionMatch && decisionMatch.length > 1) {
      return decisionMatch[1]
    }
    
    // Fallback: use the node ID as label
    return extractNodeId(nodeStr)
  }

  // Add a fallback message if no diagram is available
  if (!diagram) {
    return (
      <div className="d3-flowchart" ref={containerRef}>
        <div className="flex items-center justify-center h-[400px] bg-gray-100 dark:bg-gray-800 rounded-md">
          <p className="text-gray-500 dark:text-gray-400">No diagram data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d3-flowchart" ref={containerRef}>
      <svg 
        ref={svgRef} 
        width="100%" 
        height="600"
        className="dark-theme"
        style={{ border: '1px solid #333', borderRadius: '4px' }}
      ></svg>
    </div>
  )
}
