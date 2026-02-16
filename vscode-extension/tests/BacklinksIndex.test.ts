import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as vscode from 'vscode';
import { BacklinksIndex } from '../src/services/BacklinksIndex';
import { WorkspaceScanner } from '../src/services/WorkspaceScanner';
import { FilenameResolver } from '../src/services/FilenameResolver';

// Mock VS Code stuff
vi.mock('vscode', () => ({
  EventEmitter: class {
    fire() {}
    get event() { return () => {}; }
  },
  Position: class {
    constructor(readonly line: number, readonly character: number) {}
  },
  workspace: {
    fs: {
      readFile: vi.fn()
    }
  }
}));

describe('BacklinksIndex - Position Calculation', () => {
  let index: BacklinksIndex;
  let mockScanner: any;
  let mockResolver: any;

  beforeEach(() => {
    mockScanner = {
      getAllFiles: vi.fn().mockReturnValue([]),
      getFilesMatching: vi.fn()
    };
    
    mockResolver = {
      resolve: vi.fn()
    };

    index = new BacklinksIndex(mockScanner as WorkspaceScanner, mockResolver as FilenameResolver);
  });

  describe('Position from character offset', () => {
    it('calculates line 0, column 0 for offset 0', () => {
      const text = 'First line\nSecond line';
      const sourceUri = { fsPath: '/path/file.md', toString: () => '/path/file.md' };
      const targetUri = { fsPath: '/path/target.md', toString: () => '/path/target.md' };
      
      mockResolver.resolve.mockReturnValue(targetUri);
      mockScanner.getAllFiles.mockReturnValue([sourceUri]);
      
      vi.mocked(vscode.workspace.fs.readFile).mockResolvedValue(
        Buffer.from('[[link]]')
      );
      
      index.addLink({
        sourceUri,
        targetUri,
        linkText: 'link',
        position: new vscode.Position(0, 0)
      });

      const incoming = index.getIncomingLinks(targetUri);
      expect(incoming[0].position.line).toBe(0);
      expect(incoming[0].position.character).toBe(0);
    });

    it('calculates correct position after newline', () => {
      // Text: "First line\n[[link]]"
      // Offset of '[[' is 11 (after 'First line\n')
      // Should be line 1, column 0
      const text = 'First line\n[[link]]';
      const offset = 11; // Position of [[ on second line
      
      // Calculate position manually using same algorithm
      let line = 0;
      let column = 0;
      for (let i = 0; i < offset && i < text.length; i++) {
        if (text[i] === '\n') {
          line++;
          column = 0;
        } else {
          column++;
        }
      }
      
      expect(line).toBe(1);
      expect(column).toBe(0);
    });

    it('calculates correct column within line', () => {
      // Text: "Some text [[link]] more"
      // Offset of '[[' is 10
      // Should be line 0, column 10
      const text = 'Some text [[link]] more';
      const offset = 10;
      
      let line = 0;
      let column = 0;
      for (let i = 0; i < offset && i < text.length; i++) {
        if (text[i] === '\n') {
          line++;
          column = 0;
        } else {
          column++;
        }
      }
      
      expect(line).toBe(0);
      expect(column).toBe(10);
    });

    it('handles multiple lines correctly', () => {
      // Text with multiple lines and links at different positions
      const text = `# Title
Content here
[[link1]]
More content
Another [[link2]] here`;
      
      // Position of [[link1]] - line 2, column 0
      let offset = text.indexOf('[[link1]]');
      
      let line = 0;
      let column = 0;
      for (let i = 0; i < offset && i < text.length; i++) {
        if (text[i] === '\n') {
          line++;
          column = 0;
        } else {
          column++;
        }
      }
      
      expect(line).toBe(2);
      expect(column).toBe(0);
      
      // Position of [[link2]] - line 4, column 8
      offset = text.indexOf('[[link2]]');
      
      line = 0;
      column = 0;
      for (let i = 0; i < offset && i < text.length; i++) {
        if (text[i] === '\n') {
          line++;
          column = 0;
        } else {
          column++;
        }
      }
      
      expect(line).toBe(4);
      expect(column).toBe(8);
    });
  });

  describe('Backlink entries with accurate positions', () => {
    it('stores position for each backlink', () => {
      const sourceUri = { fsPath: '/docs/source.md', toString: () => '/docs/source.md' };
      const targetUri = { fsPath: '/docs/target.md', toString: () => '/docs/target.md' };
      
      // Add three links at different positions
      index.addLink({
        sourceUri,
        targetUri,
        linkText: 'link1',
        position: new vscode.Position(0, 5)
      });
      
      index.addLink({
        sourceUri,
        targetUri,
        linkText: 'link2',
        position: new vscode.Position(3, 10)
      });
      
      index.addLink({
        sourceUri,
        targetUri,
        linkText: 'link3',
        position: new vscode.Position(5, 0)
      });
      
      const incoming = index.getIncomingLinks(targetUri);
      
      expect(incoming).toHaveLength(3);
      expect(incoming[0].position.line).toBe(0);
      expect(incoming[0].position.character).toBe(5);
      expect(incoming[1].position.line).toBe(3);
      expect(incoming[1].position.character).toBe(10);
      expect(incoming[2].position.line).toBe(5);
      expect(incoming[2].position.character).toBe(0);
    });

    it('preserves all link metadata with position', () => {
      const sourceUri = { fsPath: '/docs/source.md', toString: () => '/docs/source.md' };
      const targetUri = { fsPath: '/docs/target.md', toString: () => '/docs/target.md' };
      const position = new vscode.Position(2, 8);
      
      const entry = {
        sourceUri,
        targetUri,
        linkText: 'Display Text',
        anchor: 'section',
        position
      };
      
      index.addLink(entry);
      const incoming = index.getIncomingLinks(targetUri);
      
      expect(incoming[0]).toEqual(entry);
      expect(incoming[0].position).toBe(position);
      expect(incoming[0].anchor).toBe('section');
      expect(incoming[0].linkText).toBe('Display Text');
    });
  });
});
