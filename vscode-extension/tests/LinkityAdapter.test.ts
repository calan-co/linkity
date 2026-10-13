import { describe, it, expect } from 'vitest';
import { LinkityAdapter } from '../src/core/LinkityAdapter';

describe('LinkityAdapter', () => {
  const adapter = new LinkityAdapter();
  
  describe('parseDocument', () => {
    it('parses simple wikilinks', () => {
      const text = 'Check out [[My Note]] for details.';
      const links = adapter.parseDocument(text);
      
      expect(links).toHaveLength(1);
      expect(links[0].value).toBe('My Note');
      expect(links[0].type).toBe('wikilink');
    });
    
    it('parses wikilinks with aliases', () => {
      const text = 'See [[Long Title|the docs]] here.';
      const links = adapter.parseDocument(text);
      
      expect(links).toHaveLength(1);
      expect(links[0].value).toBe('Long Title');
      expect(links[0].alias).toBe('the docs');
    });
    
    it('extracts link information', () => {
      const text = 'Link: [[Target#Section|Alias]]';
      const links = adapter.extractAll(text);
      
      expect(links).toHaveLength(1);
      expect(links[0].value).toBe('Target');
      expect(links[0].anchor).toBe('Section');
      expect(links[0].alias).toBe('Alias');
    });

    it('reads anchors from the Linkity fragment field', () => {
      const link = adapter.extractInfo({
        type: 'wikilink',
        value: 'Target',
        fragment: 'Section',
        position: { start: 0, end: 18 }
      });

      expect(link.value).toBe('Target');
      expect(link.anchor).toBe('Section');
    });
    
    it('resolves same-document anchors to the current document', async () => {
      const sourceFileUri = { fsPath: '/notes/current.md' };
      const resolver = {
        resolve: () => ({ fsPath: '/notes/wrong.md' }),
        resolveWithAnchorAsync: async () => ({ uri: { fsPath: '/notes/wrong.md' } })
      };
      const link = { value: '', anchor: 'Section', start: 0, end: 12 };

      expect(adapter.resolveLink(link, resolver, { sourceFileUri })).toBe(sourceFileUri);
      await expect(adapter.resolveLinkWithAnchor(link, resolver, { sourceFileUri })).resolves.toEqual({
        uri: sourceFileUri,
        anchor: 'Section'
      });
    });

    it('finds link at position', () => {
      const text = 'Check [[Note]] here';
      const link = adapter.findLinkAtPosition(text, 8); // Inside [[Note]]
      
      expect(link).not.toBeNull();
      expect(link?.value).toBe('Note');
    });
    
    it('returns null when position is not in link', () => {
      const text = 'Check [[Note]] here';
      const link = adapter.findLinkAtPosition(text, 0); // Before link
      
      expect(link).toBeNull();
    });
  });
});
