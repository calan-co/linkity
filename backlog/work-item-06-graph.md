---
status: in_progress
priority: p2
estimated_hours: 16
actual_hours: 0
start_date: 2026-02-16
dependencies: [work-item-04-backlinks]
tags: [visualization, graph, webview]
created_date: 2026-02-16
---

# Work Item 6: Knowledge Graph Visualization

## Goal
Create an interactive force-directed graph visualization showing file relationships as nodes and wikilinks as edges.

## Tasks
- [ ] Create GraphPanel webview
  - [ ] Register webview panel in extension
  - [ ] HTML/CSS/JS for graph rendering
  - [ ] Use D3.js force simulation
- [ ] Implement graph data builder
  - [ ] Convert BacklinksIndex to graph format
  - [ ] Nodes = files, edges = wikilinks
  - [ ] Calculate node metrics (link count, centrality)
- [ ] Add interactivity
  - [ ] Double-click node to open file
  - [ ] Zoom and pan controls
  - [ ] Highlight connected nodes on hover
  - [ ] Filter by search query
- [ ] Add visualization options
  - [ ] Color by link count (heatmap)
  - [ ] Size by importance
  - [ ] Show/hide orphaned files
  - [ ] Layout presets (force, hierarchical, radial)
- [ ] Optimize performance for large graphs
  - [ ] Lazy loading (virtualization)
  - [ ] Limit node count (configurable max)
  - [ ] Use WebGL for 1000+ nodes

## Technical Details

### Graph Data Format
```typescript
interface GraphNode {
  id: string;        // File URI
  label: string;     // File basename
  linkCount: number; // Incoming + outgoing
  group?: string;    // For coloring by folder/tag
}

interface GraphEdge {
  source: string;    // Source file URI
  target: string;    // Target file URI
  label?: string;    // Link text/alias
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```

### D3.js Force Simulation
```javascript
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(edges).id(d => d.id))
  .force('charge', d3.forceManyBody().strength(-300))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius(20));
```

## Deliverables
1. GraphPanel webview with D3.js visualization
2. Command: "Wikilinks: Show Knowledge Graph"
3. Interactive controls (zoom, pan, filter)
4. Performance optimization for 1k+ nodes
5. Export graph as SVG/PNG

## Acceptance Criteria
1. Opens graph panel with command
2. Shows all files as nodes, wikilinks as edges
3. Double-click node opens file in editor
4. Zoom/pan works smoothly
5. Renders 1,000 nodes in <2s
6. Updates when files change (<1s refresh)
7. Handles disconnected components (shows all)
8. Color-codes by link count (visual heatmap)

## Dependencies
- Work Item 4: BacklinksIndex (provides graph data)

## Notes
- Consider using vis.js or Cytoscape as alternative
- For 10k+ nodes, may need WebGL (force-graph library)
- Future: 3D graph visualization option
