import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { FlashcardModule } from '../flashcard/flashcard.module';
import { MindmapModule } from '../mindmap/mindmap.module';
import { IngestService } from './application/ingest.service';
import { PDF_EXTRACTOR, type PdfExtractor } from './domain/ports/pdf-extractor.port';
import { MockPdfExtractor } from './infrastructure/mock-pdf.adapter';
import { PdfParseExtractor } from './infrastructure/pdf-parse.adapter';
import { IngestController } from './presentation/ingest.controller';

/**
 * F6 — PDF upload ingest. Reuses AI routing + mindmap + flashcard services.
 * The PDF extractor is bound to the mock in NIGHT_SHIFT_MODE, the real
 * pdf-parse adapter otherwise (extraction needs no credentials, but the upload
 * flow defers to PH-004 / R2 for production).
 */
@Module({
  imports: [AiModule, AuthModule, MindmapModule, FlashcardModule],
  controllers: [IngestController],
  providers: [
    IngestService,
    MockPdfExtractor,
    PdfParseExtractor,
    {
      provide: PDF_EXTRACTOR,
      useFactory: (
        mock: MockPdfExtractor,
        real: PdfParseExtractor,
        config: ConfigService,
      ): PdfExtractor => (config.get<string>('NIGHT_SHIFT_MODE') === 'true' ? mock : real),
      inject: [MockPdfExtractor, PdfParseExtractor, ConfigService],
    },
  ],
})
export class IngestModule {}
