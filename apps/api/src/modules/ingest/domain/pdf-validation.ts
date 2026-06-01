/**
 * Pure validation helpers for the PDF ingest flow (F6).
 *
 * Framework-free (no Nest imports) so the rules can be unit-tested directly and
 * reused by both the upload controller and the application service. The service
 * layer is responsible for translating {@link PdfValidationError} into an HTTP
 * response (e.g. BadRequestException) — the domain stays transport-agnostic.
 */

/** Accepted upload MIME types. PDF only for the MVP (slides come in F7). */
export const PDF_MIME_TYPES = ['application/pdf'] as const;

/** Hard upload ceiling. Matches the Cloudflare R2 free-tier comfort zone (PH-004). */
export const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Minimum number of extracted characters worth sending to the AI. A scanned
 * (image-only) PDF yields almost no text via pdf-parse, so we fail fast with a
 * helpful message instead of generating an empty mind map.
 */
export const MIN_EXTRACTED_CHARS = 80;

export interface UploadedFileMeta {
  mimetype: string;
  size: number;
  originalname?: string;
}

/** Domain-level validation failure. The code is a stable machine key for the API envelope. */
export class PdfValidationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'PdfValidationError';
  }
}

/**
 * Validate an uploaded file's metadata before we spend effort extracting text.
 * Throws {@link PdfValidationError} on the first problem.
 */
export function validatePdfUpload(
  file: UploadedFileMeta | undefined,
  opts: { maxBytes?: number } = {},
): void {
  const maxBytes = opts.maxBytes ?? MAX_PDF_BYTES;
  if (!file) {
    throw new PdfValidationError('NO_FILE', 'Chưa có file nào được tải lên');
  }
  if (!PDF_MIME_TYPES.includes(file.mimetype as (typeof PDF_MIME_TYPES)[number])) {
    throw new PdfValidationError('UNSUPPORTED_FILE_TYPE', 'Chỉ chấp nhận file PDF (.pdf)');
  }
  if (file.size <= 0) {
    throw new PdfValidationError('EMPTY_FILE', 'File rỗng, không có nội dung');
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    throw new PdfValidationError('FILE_TOO_LARGE', `File vượt quá giới hạn ${mb}MB`);
  }
}

/**
 * Guard that the extracted text is substantial enough to generate from.
 * Throws {@link PdfValidationError} with code `INSUFFICIENT_TEXT` otherwise.
 */
export function assertEnoughText(text: string, min = MIN_EXTRACTED_CHARS): void {
  if (text.trim().length < min) {
    throw new PdfValidationError(
      'INSUFFICIENT_TEXT',
      'Không trích xuất đủ nội dung từ PDF (có thể là PDF scan ảnh, chưa hỗ trợ OCR).',
    );
  }
}
