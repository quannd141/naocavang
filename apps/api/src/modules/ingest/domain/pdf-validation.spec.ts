import { describe, expect, it } from 'vitest';
import {
  MAX_PDF_BYTES,
  PdfValidationError,
  assertEnoughText,
  validatePdfUpload,
} from './pdf-validation';

describe('validatePdfUpload', () => {
  const validFile = { mimetype: 'application/pdf', size: 1024, originalname: 'doc.pdf' };

  it('passes a well-formed PDF upload', () => {
    expect(() => validatePdfUpload(validFile)).not.toThrow();
  });

  it('throws NO_FILE when nothing is uploaded', () => {
    expect(() => validatePdfUpload(undefined)).toThrowError(
      expect.objectContaining({ code: 'NO_FILE' }),
    );
  });

  it('rejects non-PDF mime types', () => {
    expect(() => validatePdfUpload({ ...validFile, mimetype: 'image/png' })).toThrowError(
      expect.objectContaining({ code: 'UNSUPPORTED_FILE_TYPE' }),
    );
  });

  it('rejects empty (zero-byte) files', () => {
    expect(() => validatePdfUpload({ ...validFile, size: 0 })).toThrowError(
      expect.objectContaining({ code: 'EMPTY_FILE' }),
    );
  });

  it('rejects files over the size ceiling', () => {
    expect(() => validatePdfUpload({ ...validFile, size: MAX_PDF_BYTES + 1 })).toThrowError(
      expect.objectContaining({ code: 'FILE_TOO_LARGE' }),
    );
  });

  it('honours a custom maxBytes', () => {
    expect(() => validatePdfUpload({ ...validFile, size: 2048 }, { maxBytes: 1024 })).toThrowError(
      PdfValidationError,
    );
  });
});

describe('assertEnoughText', () => {
  it('accepts text above the minimum', () => {
    expect(() => assertEnoughText('a'.repeat(100))).not.toThrow();
  });

  it('rejects text below the minimum (scanned PDF)', () => {
    expect(() => assertEnoughText('   short   ')).toThrowError(
      expect.objectContaining({ code: 'INSUFFICIENT_TEXT' }),
    );
  });

  it('counts trimmed length, not raw length', () => {
    const padded = `${' '.repeat(200)}hi${' '.repeat(200)}`;
    expect(() => assertEnoughText(padded)).toThrowError(PdfValidationError);
  });
});
