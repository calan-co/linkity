import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as vscode from 'vscode';
import { FilenameResolver } from '../src/services/FilenameResolver';
import { WorkspaceScanner } from '../src/services/WorkspaceScanner';
import { ConfigManager } from '../src/utils/ConfigManager';

// Mock VS Code stuff
vi.mock('vscode', () => ({
  window: {
    showQuickPick: vi.fn()
  },
  Uri: {
    file: (path: string) => ({ fsPath: path, toString: () => path })
  },
  Position: class {
    constructor(readonly line: number, readonly character: number) {}
  }
}));

describe('FilenameResolver', () => {
  let resolver: FilenameResolver;
  let mockScanner: any;
  let mockConfig: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockScanner = {
      getFilesMatching: vi.fn(),
      getAllFiles: vi.fn()
    };
    
    mockConfig = {
      getLinkResolution: vi.fn().mockReturnValue('mostSpecific')
    };

    resolver = new FilenameResolver(mockScanner as WorkspaceScanner, mockConfig as ConfigManager);
  });

  describe('resolve - sync version', () => {
    it('returns null for no matches', () => {
      mockScanner.getFilesMatching.mockReturnValue([]);
      
      const result = resolver.resolve('nonexistent');
      
      expect(result).toBeNull();
    });

    it('returns single match immediately', () => {
      const file = { fsPath: '/path/to/note.md', toString: () => '/path/to/note.md' };
      mockScanner.getFilesMatching.mockReturnValue([file]);
      
      const result = resolver.resolve('note');
      
      expect(result).toEqual(file);
    });

    it('applies firstMatch strategy', () => {
      const files = [
        { fsPath: '/path/a.md', toString: () => '/path/a.md' },
        { fsPath: '/path/b.md', toString: () => '/path/b.md' }
      ];
      mockScanner.getFilesMatching.mockReturnValue(files);
      mockConfig.getLinkResolution.mockReturnValue('firstMatch');
      
      const result = resolver.resolve('file', { strategy: 'firstMatch' });
      
      expect(result).toEqual(files[0]);
    });

    it('applies mostSpecific strategy (shortest path context)', () => {
      const files = [
        { fsPath: '/path/a/note.md', toString: () => '/path/a/note.md' },
        { fsPath: '/path/note.md', toString: () => '/path/note.md' }
      ];
      const sourceUri = { fsPath: '/path/source.md', toString: () => '/path/source.md' };
      mockScanner.getFilesMatching.mockReturnValue(files);
      
      const result = resolver.resolve('note', { 
        sourceFileUri: sourceUri,
        strategy: 'mostSpecific' 
      });
      
      // /path/note.md is shorter relative path from /path/source.md
      expect(result).toEqual(files[1]);
    });

    it('ignores .md extension in input', () => {
      const file = { fsPath: '/path/note.md', toString: () => '/path/note.md' };
      mockScanner.getFilesMatching.mockReturnValue([file]);
      
      const result = resolver.resolve('note.md');
      
      expect(result).toEqual(file);
      expect(mockScanner.getFilesMatching).toHaveBeenCalledWith('note');
    });
  });

  describe('resolveAsync - async version with interactive picker', () => {
    it('shows picker for interactive strategy with multiple matches', async () => {
      const files = [
        { fsPath: '/workspace/docs/index.md', toString: () => '/workspace/docs/index.md' },
        { fsPath: '/workspace/src/index.md', toString: () => '/workspace/src/index.md' }
      ];
      const selected = files[0];
      
      mockScanner.getFilesMatching.mockReturnValue(files);
      vi.mocked(vscode.window.showQuickPick).mockResolvedValue({ uri: selected } as any);
      
      const result = await resolver.resolveAsync('index', { 
        strategy: 'interactive' 
      });
      
      expect(result).toEqual(selected);
      expect(vscode.window.showQuickPick).toHaveBeenCalled();
    });

    it('returns null when picker is cancelled', async () => {
      const files = [
        { fsPath: '/path/note.md', toString: () => '/path/note.md' },
        { fsPath: '/path/a/note.md', toString: () => '/path/a/note.md' }
      ];
      
      mockScanner.getFilesMatching.mockReturnValue(files);
      vi.mocked(vscode.window.showQuickPick).mockResolvedValue(undefined as any);
      
      const result = await resolver.resolveAsync('note', { 
        strategy: 'interactive' 
      });
      
      expect(result).toBeNull();
    });

    it('no picker when single match', async () => {
      const file = { fsPath: '/path/note.md', toString: () => '/path/note.md' };
      mockScanner.getFilesMatching.mockReturnValue([file]);
      
      const result = await resolver.resolveAsync('note', { 
        strategy: 'interactive' 
      });
      
      expect(result).toEqual(file);
      expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
    });

    it('falls back to mostSpecific for ambiguous when strategy not interactive', async () => {
      const files = [
        { fsPath: '/a/note.md', toString: () => '/a/note.md' },
        { fsPath: '/note.md', toString: () => '/note.md' }
      ];
      const sourceUri = { fsPath: '/source.md', toString: () => '/source.md' };
      
      mockScanner.getFilesMatching.mockReturnValue(files);
      
      const result = await resolver.resolveAsync('note', { 
        sourceFileUri: sourceUri,
        strategy: 'mostSpecific'
      });
      
      // Should use mostSpecific, not show picker
      expect(result).toEqual(files[1]);
      expect(vscode.window.showQuickPick).not.toHaveBeenCalled();
    });
  });

  describe('suggestSimilar', () => {
    it('returns files matching substring', () => {
      const files = [
        { fsPath: '/path/notes.md', toString: () => '/path/notes.md' },
        { fsPath: '/path/index.md', toString: () => '/path/index.md' },
        { fsPath: '/path/nested/notes-archived.md', toString: () => '/path/nested/notes-archived.md' }
      ];
      mockScanner.getAllFiles.mockReturnValue(files);
      
      const result = resolver.suggestSimilar('note');
      
      expect(result).toContain(files[0]);
      expect(result).toContain(files[2]);
      expect(result).not.toContain(files[1]);
    });

    it('respects maxResults limit', () => {
      const files = Array(10).fill(null).map((_, i) => ({
        fsPath: `/path/note${i}.md`,
        toString: () => `/path/note${i}.md`
      }));
      mockScanner.getAllFiles.mockReturnValue(files);
      
      const result = resolver.suggestSimilar('note', 3);
      
      expect(result).toHaveLength(3);
    });
  });
});
