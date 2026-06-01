import { Injectable, Logger } from '@nestjs/common';
import type { PdfExtractionResult, PdfExtractor } from '../domain/ports/pdf-extractor.port';

/**
 * Real PDF text extractor backed by `pdf-parse` (a local, offline library — no
 * network, no API cost, so it is safe outside night-shift).
 *
 * NOTE: `pdf-parse` is imported lazily inside {@link extract} on purpose.
 * Importing it at module load triggers a long-standing bug where the package's
 * index runs demo code that reads a bundled sample PDF from disk and throws.
 * The dynamic import defers that until we actually have a buffer to parse, and
 * means night-shift (which binds {@link MockPdfExtractor}) never loads it.
 *
 * TODO(PH-004): wire this adapter via a useFactory once R2 + real uploads exist;
 * extraction itself needs no credentials, but the surrounding upload flow does.
 */
@Injectable()
export class PdfParseExtractor implements PdfExtractor {
  private readonly logger = new Logger(PdfParseExtractor.name);

  async extract(buffer: Buffer): Promise<PdfExtractionResult> {
    const { default: pdfParse } = await import('pdf-parse');
    const parsed = await pdfParse(buffer);
    this.logger.debug(
      `[pdf-parse] extracted ${parsed.text?.length ?? 0} chars / ${parsed.numpages} pages`,
    );
    return { text: parsed.text ?? '', pageCount: parsed.numpages ?? 0 };
  }
}
