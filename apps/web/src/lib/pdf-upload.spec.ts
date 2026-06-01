import { describe, expect, it } from 'vitest';
import { MAX_PDF_BYTES, formatBytes, validatePdfFile } from './pdf-upload';

describe('validatePdfFile', () => {
  const pdf = { name: 'doc.pdf', type: 'application/pdf', size: 2048 };

  it('accepts a valid PDF', () => {
    expect(validatePdfFile(pdf)).toEqual({ ok: true });
  });

  it('accepts by extension when mime is generic', () => {
    expect(validatePdfFile({ ...pdf, type: 'application/octet-stream' }).ok).toBe(true);
  });

  it('rejects a missing file', () => {
    expect(validatePdfFile(null).ok).toBe(false);
  });

  it('rejects a non-PDF', () => {
    expect(validatePdfFile({ name: 'a.png', type: 'image/png', size: 10 }).ok).toBe(false);
  });

  it('rejects an empty file', () => {
    expect(validatePdfFile({ ...pdf, size: 0 }).ok).toBe(false);
  });

  it('rejects an oversized file', () => {
    const res = validatePdfFile({ ...pdf, size: MAX_PDF_BYTES + 1 });
    expect(res.ok).toBe(false);
    expect(res.error).toContain('10MB');
  });
});

describe('formatBytes', () => {
  it('formats bytes, KB and MB', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
