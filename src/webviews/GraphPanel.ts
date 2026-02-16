import * as vscode from 'vscode';
import { BacklinksIndex } from '../services/BacklinksIndex';
import { WorkspaceScanner } from '../services/WorkspaceScanner';
import { GraphBuilder } from '../services/GraphBuilder';
import * as path from 'path';

export interface GraphNode {
  id: string;
  label: string;
  linkCount: number;
  incomingCount: number;
  outgoingCount: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export class GraphPanel {
  private static currentPanel: GraphPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];
  private graphBuilder: GraphBuilder;

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    private backlinksIndex: BacklinksIndex,
    private scanner: WorkspaceScanner
  ) {
    this.panel = panel;
    this.graphBuilder = new GraphBuilder(backlinksIndex, scanner);

    // Set HTML content
    this.panel.webview.html = this.getWebviewContent(this.panel.webview, extensionUri);

    // Handle messages from webview
    this.panel.webview.onDidReceiveMessage(
      message => this.handleMessage(message),
      null,
      this.disposables
    );

    // Handle panel closure
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  static createOrShow(
    extensionUri: vscode.Uri,
    backlinksIndex: BacklinksIndex,
    scanner: WorkspaceScanner
  ): void {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (GraphPanel.currentPanel) {
      GraphPanel.currentPanel.panel.reveal(column);
      GraphPanel.currentPanel.refresh();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'graphPanel',
      'Knowledge Graph',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: []
      }
    );

    GraphPanel.currentPanel = new GraphPanel(panel, extensionUri, backlinksIndex, scanner);
  }

  private async handleMessage(message: any): Promise<void> {
    switch (message.command) {
      case 'openFile':
        if (message.uri) {
          const uri = vscode.Uri.parse(message.uri);
          await vscode.commands.executeCommand('vscode.open', uri);
        }
        break;
      case 'refreshData':
        this.refresh();
        break;
    }
  }

  private refresh(): void {
    const data = this.buildGraphData();
    this.panel.webview.postMessage({
      command: 'updateGraph',
      data
    });
  }

  private buildGraphData() {
    return this.graphBuilder.buildGraph();
  }

  private getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Knowledge Graph</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            overflow: hidden;
            height: 100vh;
        }
        
        #graph-container {
            width: 100%;
            height: 100%;
            position: relative;
        }
        
        svg {
            width: 100%;
            height: 100%;
        }
        
        .node {
            cursor: pointer;
        }
        
        .node circle {
            stroke: var(--vscode-activityBar-border);
            stroke-width: 2px;
        }
        
        .node text {
            font-size: 11px;
            pointer-events: none;
        }
        
        .link {
            stroke: var(--vscode-activityBar-border);
            stroke-opacity: 0.6;
        }
        
        .controls {
            position: absolute;
            top: 10px;
            right: 10px;
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-activityBar-border);
            border-radius: 4px;
            padding: 10px;
            z-index: 10;
        }
        
        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            margin: 4px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }
        
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        .stats {
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-activityBar-border);
            border-radius: 4px;
            padding: 10px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div id="graph-container">
        <div class="controls">
            <button id="resetZoom">Reset Zoom</button>
            <button id="resetForce">Restart Force</button>
            <button id="refreshBtn">Refresh</button>
        </div>
        <div class="stats">
            <div>Nodes: <span id="nodeCount">0</span></div>
            <div>Links: <span id="linkCount">0</span></div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        let simulation = null;
        let svg = null;
        let g = null;
        let graphData = null;
        
        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        let width = window.innerWidth - margin.left - margin.right;
        let height = window.innerHeight - margin.top - margin.bottom;
        
        function initVisualization() {
            // Clear previous
            d3.select('svg').remove();
            
            // Create SVG
            svg = d3.select('#graph-container')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');
            
            g = svg.append('g')
                .attr('transform', \`translate(\${margin.left},\${margin.top})\`);
            
            // Add zoom behavior
            const zoom = d3.zoom()
                .on('zoom', (event) => {
                    g.attr('transform', event.transform);
                });
            
            svg.call(zoom);
            
            // Initialize force simulation
            if (graphData && graphData.nodes.length > 0) {
                renderGraph();
            }
        }
        
        function renderGraph() {
            if (!graphData || !graphData.nodes.length) {
                return;
            }
            
            // Create force simulation
            simulation = d3.forceSimulation(graphData.nodes)
                .force('link', d3.forceLink(graphData.edges)
                    .id(d => d.id)
                    .distance(100)
                    .strength(0.5))
                .force('charge', d3.forceManyBody()
                    .strength(-300)
                    .distanceMax(500))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('collision', d3.forceCollide()
                    .radius(d => Math.sqrt(d.linkCount) * 5 + 10));
            
            // Render links
            const links = g.selectAll('.link')
                .data(graphData.edges, d => \`\${d.source.id}-\${d.target.id}\`)
                .join('line')
                .attr('class', 'link');
            
            // Render nodes
            const nodes = g.selectAll('.node')
                .data(graphData.nodes, d => d.id)
                .join('g')
                .attr('class', 'node')
                .call(drag(simulation));
            
            nodes.append('circle')
                .attr('r', d => Math.sqrt(d.linkCount) * 5 + 10)
                .attr('fill', d => {
                    // Color by incoming link count (heatmap)
                    const intensity = Math.min(d.incomingCount / 10, 1);
                    return d3.interpolateViridis(intensity);
                })
                .on('click', (event, d) => {
                    event.stopPropagation();
                    vscode.postMessage({
                        command: 'openFile',
                        uri: d.id
                    });
                });
            
            nodes.append('text')
                .attr('dy', '.25em')
                .attr('text-anchor', 'middle')
                .text(d => d.label)
                .style('font-size', '11px')
                .style('pointer-events', 'none');
            
            // Update positions on tick
            simulation.on('tick', () => {
                links
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);
                
                nodes
                    .attr('transform', d => \`translate(\${d.x},\${d.y})\`);
            });
            
            // Update stats
            document.getElementById('nodeCount').textContent = graphData.nodes.length;
            document.getElementById('linkCount').textContent = graphData.edges.length;
        }
        
        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            
            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            
            return d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended);
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            width = window.innerWidth - margin.left - margin.right;
            height = window.innerHeight - margin.top - margin.bottom;
            initVisualization();
        });
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            if (message.command === 'updateGraph') {
                graphData = message.data;
                initVisualization();
            }
        });
        
        // Button handlers
        document.getElementById('resetZoom').addEventListener('click', () => {
            svg.transition().duration(750).call(
                d3.zoom().transform,
                d3.zoomIdentity.translate(margin.left, margin.top)
            );
        });
        
        document.getElementById('resetForce').addEventListener('click', () => {
            if (simulation) {
                simulation.alpha(1).restart();
            }
        });
        
        document.getElementById('refreshBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'refreshData' });
        });
        
        // Request initial data
        vscode.postMessage({ command: 'refreshData' });
    </script>
</body>
</html>`;
  }

  dispose(): void {
    GraphPanel.currentPanel = undefined;

    this.panel.dispose();

    while (this.disposables.length) {
      const x = this.disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
