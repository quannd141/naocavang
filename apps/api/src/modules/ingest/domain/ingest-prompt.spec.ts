import { describe, expect, it } from 'vitest';
import {
  MAX_PROMPT_CHARS,
  buildFlashcardPrompt,
  buildMindmapPrompt,
  truncateForPrompt,
} from './ingest-prompt';

describe('truncateForPrompt', () => {
  it('returns short text unchanged (trimmed)', () => {
    expect(truncateForPrompt('  hello  ')).toBe('hello');
  });

  it('caps long text at the limit', () => {
    expect(truncateForPrompt('a'.repeat(MAX_PROMPT_CHARS + 500)).length).toBe(MAX_PROMPT_CHARS);
  });
});

describe('prompt builders', () => {
  it('embed the (truncated) source text', () => {
    const long = 'b'.repeat(MAX_PROMPT_CHARS + 100);
    expect(buildMindmapPrompt(long)).toContain('b'.repeat(50));
    expect(buildMindmapPrompt(long).length).toBeLessThan(long.length + 600);
  });

  it('produce distinct mind-map vs flashcard instructions', () => {
    expect(buildMindmapPrompt('x')).toContain('mind map');
    expect(buildFlashcardPrompt('x')).toContain('flashcard');
  });
});
