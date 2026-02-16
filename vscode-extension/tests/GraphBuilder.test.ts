import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GraphBuilder } from '../src/services/GraphBuilder';
import { BacklinksIndex } from '../src/services/BacklinksIndex';
import { WorkspaceScanner } from '../src/services/WorkspaceScanner';

// Mock Uri helper
const createUri = (path: string) => ({
  toString: () => path,
  fsPath: path.replace('file:///', '/'),
  scheme: 'file'
});

describe('GraphBuilder', () => {
  let graphBuilder: GraphBuilder;
  let mockBacklinksIndex: Partial<BacklinksIndex>;
  let mockScanner: Partial<WorkspaceScanner>;

  beforeEach(() => {
    // Mock BacklinksIndex
    mockBacklinksIndex = {
      getIncomingLinks: vi.fn((uri) => {
        const uri1 = 'file:///workspace/a.md';
        const uri2 = 'file:///workspace/b.md';
        const uri3 = 'file:///workspace/c.md';

        if (uri.toString() === uri2) {
          return [
            { sourceUri: createUri(uri1), targetUri: createUri(uri2), linkText: '[[b]]' },
            { sourceUri: createUri(uri3), targetUri: createUri(uri2), linkText: '[[b]]' }
          ];
        }
        return [];
      }),
      getOutgoingLinks: vi.fn((uri) => {
        const uri1 = 'file:///workspace/a.md';
        const uri2 = 'file:///workspace/b.md';
        const uri3 = 'file:///workspace/c.md';

        if (uri.toString() === uri1) {
          return [
            { sourceUri: createUri(uri1), targetUri: createUri(uri2), linkText: '[[b]]' }
          ];
        } else if (uri.toString() === uri3) {
          return [
            { sourceUri: createUri(uri3), targetUri: createUri(uri2), linkText: '[[b]]' }
          ];
        }
        return [];
      })
    };

    // Mock WorkspaceScanner
    mockScanner = {
      getAllFiles: vi.fn(() => [
        createUri('file:///workspace/a.md'),
        createUri('file:///workspace/b.md'),
        createUri('file:///workspace/c.md')
      ])
    };

    graphBuilder = new GraphBuilder(mockBacklinksIndex as BacklinksIndex, mockScanner as WorkspaceScanner);
  });

  it('builds complete graph with all nodes and edges', () => {
    const graph = graphBuilder.buildGraph();

    expect(graph.nodes).toHaveLength(3);
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it('includes node metadata (incoming, outgoing counts)', () => {
    const graph = graphBuilder.buildGraph();
    const bNode = graph.nodes.find(n => n.label === 'b');

    expect(bNode).toBeDefined();
    expect(bNode?.incomingCount).toBe(2);
    expect(bNode?.outgoingCount).toBe(0);
  });

  it('deduplicates edges', () => {
    const graph = graphBuilder.buildGraph();
    const edgeSet = new Set(graph.edges.map(e => `${e.source}|${e.target}`));

    expect(edgeSet.size).toBe(graph.edges.length);
  });

  it('builds subgraph with specified depth', () => {
    const centerUri = createUri('file:///workspace/b.md');
    const subgraph = graphBuilder.buildSubgraph(centerUri as any, 1);

    expect(subgraph.nodes.length).toBeGreaterThan(0);
    expect(subgraph.nodes.some(n => n.id === centerUri.toString())).toBe(true);
  });

  it('calculates statistics correctly', () => {
    const stats = graphBuilder.getStatistics();

    expect(stats.totalNodes).toBe(3);
    expect(stats.totalEdges).toBeGreaterThan(0);
    expect(stats.averageLinksPerNode).toBeGreaterThan(0);
  });

  it('identifies orphaned nodes', () => {
    const stats = graphBuilder.getStatistics();
    expect(stats.orphanedNodes).toBeGreaterThanOrEqual(0);
  });

  it('identifies hub nodes with many incoming links', () => {
    const stats = graphBuilder.getStatistics();
    expect(stats.hubNodes).toBeDefined();
    expect(Array.isArray(stats.hubNodes)).toBe(true);
  });
});

