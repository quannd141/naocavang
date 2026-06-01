import { Injectable, Logger } from '@nestjs/common';
import type { PdfExtractionResult, PdfExtractor } from '../domain/ports/pdf-extractor.port';

/**
 * Deterministic mock PDF extractor for tests + night-shift mode.
 *
 * Per night-shift Constraint 1, we never parse a real upload until a human
 * provisions the real flow. This returns a fixed Vietnamese passage long enough
 * to exercise the downstream AI-generation pipeline (mind map + flashcards).
 */
@Injectable()
export class MockPdfExtractor implements PdfExtractor {
  private readonly logger = new Logger(MockPdfExtractor.name);

  async extract(buffer: Buffer): Promise<PdfExtractionResult> {
    this.logger.debug(`[MOCK PDF] extracting ${buffer.length} bytes → fixed sample text`);
    return { text: MOCK_PDF_TEXT, pageCount: 3 };
  }
}

/** ~3 short paragraphs (>80 chars) so assertEnoughText passes and AI gen has context. */
const MOCK_PDF_TEXT = [
  'Quang hợp là quá trình thực vật, tảo và một số vi khuẩn sử dụng năng lượng ánh sáng',
  'để tổng hợp chất hữu cơ từ khí cacbonic và nước, đồng thời giải phóng khí oxy.',
  '',
  'Quá trình quang hợp gồm hai pha: pha sáng diễn ra ở màng tilacoit và pha tối (chu trình',
  'Calvin) diễn ra ở chất nền lục lạp. Sắc tố diệp lục hấp thụ ánh sáng để tạo ATP và NADPH.',
  '',
  'Phương trình tổng quát: 6CO2 + 12H2O → C6H12O6 + 6O2 + 6H2O dưới tác dụng của ánh sáng',
  'và diệp lục. Đây là nội dung giả lập (mock) dùng cho chế độ phát triển night-shift.',
].join('\n');
