import { describe, expect, it } from 'vitest';
import { MIN_EXTRACTED_CHARS } from '../domain/pdf-validation';
import { MockPdfExtractor } from './mock-pdf.adapter';

describe('MockPdfExtractor', () => {
  const extractor = new MockPdfExtractor();

  it('returns deterministic text and a page count', async () => {
    const a = await extractor.extract(Buffer.from('%PDF-1.4 fake'));
    const b = await extractor.extract(Buffer.from('different bytes'));
    expect(a.text).toBe(b.text); // deterministic, ignores input bytes
    expect(a.pageCount).toBe(3);
  });

  it('returns enough text to pass the INSUFFICIENT_TEXT guard', async () => {
    const { text } = await extractor.extract(Buffer.from('x'));
    expect(text.trim().length).toBeGreaterThan(MIN_EXTRACTED_CHARS);
  });
});
