import * as vscode from 'vscode';
import * as path from 'path';
import { BacklinksIndex, BacklinkEntry } from './BacklinksIndex';
import { WorkspaceScanner } from './WorkspaceScanner';

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
}

export interface GraphDataSet {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Builds graph data from BacklinksIndex for visualization
 */
export class GraphBuilder {
  constructor(
    private backlinksIndex: BacklinksIndex,
    private scanner: WorkspaceScanner
  ) {}

  /**
   * Build complete graph from all indexed links
   */
  buildGraph(): GraphDataSet {
    const nodes = new Map<string, GraphNode>();
    const edgesSet = new Set<string>(); // Deduplicates edges
    const edgesList: GraphEdge[] = [];

    const allFiles = this.scanner.getAllFiles();

    // Create nodes for all files
    for (const uri of allFiles) {
      const incoming = this.backlinksIndex.getIncomingLinks(uri);
      const outgoing = this.backlinksIndex.getOutgoingLinks(uri);
      const linkCount = incoming.length + outgoing.length;

      nodes.set(uri.toString(), {
        id: uri.toString(),
        label: path.basename(uri.fsPath, '.md'),
        linkCount,
        incomingCount: incoming.length,
        outgoingCount: outgoing.length
      });
    }

    // Build edges from outgoing links
    for (const uri of allFiles) {
      const outgoing = this.backlinksIndex.getOutgoingLinks(uri);
      for (const entry of outgoing) {
        const edgeKey = `${uri.toString()}|${entry.targetUri.toString()}`;
        if (!edgesSet.has(edgeKey)) {
          edgesSet.add(edgeKey);
          edgesList.push({
            source: uri.toString(),
            target: entry.targetUri.toString()
          });
        }
      }
    }

    return {
      nodes: Array.from(nodes.values()),
      edges: edgesList
    };
  }

  /**
   * Build subgraph for a specific file and its neighbors
   * @param uri Center file URI
   * @param hops Number of hops to include (default 1)
   */
  buildSubgraph(uri: vscode.Uri, hops: number = 1): GraphDataSet {
    const nodes = new Map<string, GraphNode>();
    const edgesSet = new Set<string>();
    const edgesList: GraphEdge[] = [];
    const visited = new Set<string>();

    const visit = (currentUri: vscode.Uri, depth: number) => {
      const uriStr = currentUri.toString();
      if (visited.has(uriStr) || depth > hops) {
        return;
      }
      visited.add(uriStr);

      // Add node
      const incoming = this.backlinksIndex.getIncomingLinks(currentUri);
      const outgoing = this.backlinksIndex.getOutgoingLinks(currentUri);
      const linkCount = incoming.length + outgoing.length;

      nodes.set(uriStr, {
        id: uriStr,
        label: path.basename(currentUri.fsPath, '.md'),
        linkCount,
        incomingCount: incoming.length,
        outgoingCount: outgoing.length
      });

      // Recursively visit neighbors
      if (depth < hops) {
        for (const entry of incoming) {
          visit(entry.sourceUri, depth + 1);
        }
        for (const entry of outgoing) {
          visit(entry.targetUri, depth + 1);
        }
      }

      // Add edges from this node
      for (const entry of outgoing) {
        if (visited.has(entry.targetUri.toString())) {
          const edgeKey = `${uriStr}|${entry.targetUri.toString()}`;
          if (!edgesSet.has(edgeKey)) {
            edgesSet.add(edgeKey);
            edgesList.push({
              source: uriStr,
              target: entry.targetUri.toString()
            });
          }
        }
      }
    };

    visit(uri, 0);

    return {
      nodes: Array.from(nodes.values()),
      edges: edgesList
    };
  }

  /**
   * Get statistics about the graph
   */
  getStatistics() {
    const graph = this.buildGraph();
    const incomingCounts = graph.nodes.map(n => n.incomingCount);
    const outgoingCounts = graph.nodes.map(n => n.outgoingCount);

    return {
      totalNodes: graph.nodes.length,
      totalEdges: graph.edges.length,
      orphanedNodes: graph.nodes.filter(n => n.linkCount === 0).length,
      hubNodes: graph.nodes.filter(n => n.incomingCount > 5),
      averageLinksPerNode: graph.nodes.reduce((sum, n) => sum + n.linkCount, 0) / graph.nodes.length,
      maxIncoming: Math.max(...incomingCounts, 0),
      maxOutgoing: Math.max(...outgoingCounts, 0)
    };
  }
}
