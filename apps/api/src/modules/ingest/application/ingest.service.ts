import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { AiRoutingService } from '../../ai/application/ai-routing.service';
import { FlashcardService } from '../../flashcard/application/flashcard.service';
import { MindMapService } from '../../mindmap/application/mindmap.service';
import { normaliseIngestedCards, titleFromFileName } from '../domain/ingest-normalise';
import { buildFlashcardPrompt, buildMindmapPrompt } from '../domain/ingest-prompt';
import { aiMindmapToCanvas, parseAiJson } from '../domain/mindmap-transform';
import { PdfValidationError, assertEnoughText, validatePdfUpload } from '../domain/pdf-validation';
import { PDF_EXTRACTOR, type PdfExtractor } from '../domain/ports/pdf-extractor.port';

/** Minimal shape we need from a multer file (decoupled from Express types). */
export interface IngestFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname?: string;
}

export interface IngestOptions {
  /** Override the auto-derived title. */
  title?: string;
  /** Subject hint stored on the created mind map. */
  subject?: string;
}

export interface IngestResult {
  mindmapId: string;
  deckId: string | null;
  title: string;
  cardCount: number;
  meta: {
    pageCount: number;
    textLength: number;
    models: { mindmap: string; flashcard: string };
  };
}

/**
 * F6 — PDF ingest pipeline. Orchestrates: validate → extract text → AI generate
 * (mind map + flashcards) → persist via the existing mindmap/flashcard services.
 *
 * Stateless + transient: the uploaded bytes are never stored (no R2 dependency
 * yet, PH-004); only the generated mind map + deck are persisted. The created
 * mind map is stamped `sourceType: 'pdf'`.
 */
@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    @Inject(PDF_EXTRACTOR) private readonly extractor: PdfExtractor,
    private readonly ai: AiRoutingService,
    private readonly mindmaps: MindMapService,
    private readonly flashcards: FlashcardService,
  ) {}

  async ingestPdf(
    userId: string,
    file: IngestFile,
    opts: IngestOptions = {},
  ): Promise<IngestResult> {
    // 1. Validate the upload, then extract + guard text length.
    this.toBadRequest(() => validatePdfUpload(file));
    const { text, pageCount } = await this.extractor.extract(file.buffer);
    this.toBadRequest(() => assertEnoughText(text));

    const title = opts.title?.trim() || titleFromFileName(file.originalname);

    // 2. Generate the mind map and persist it (must succeed — it's the anchor
    //    the flashcard deck attaches to).
    const mmRes = await this.ai.generate({
      userId,
      task: 'mindmap_gen',
      prompt: buildMindmapPrompt(text),
      jsonMode: true,
    });
    const canvas = aiMindmapToCanvas(this.parse(mmRes.content));
    if (canvas.nodes.length === 0) {
      throw new BadRequestException({
        code: 'EMPTY_MINDMAP',
        message: 'AI không tạo được mind map từ tài liệu này. Thử lại hoặc kiểm tra nội dung PDF.',
      });
    }
    const mindmap = await this.mindmaps.createFromIngest(userId, {
      title,
      data: canvas as unknown as Record<string, unknown>,
      subject: opts.subject,
    });

    // 3. Generate flashcards (best-effort — an empty result still leaves the
    //    user with a usable mind map rather than failing the whole upload).
    const fcRes = await this.ai.generate({
      userId,
      task: 'flashcard_gen',
      prompt: buildFlashcardPrompt(text),
      jsonMode: true,
    });
    const cards = normaliseIngestedCards(this.parse(fcRes.content));
    let deckId: string | null = null;
    if (cards.length > 0) {
      const deck = await this.flashcards.createDeck(userId, {
        title: `Flashcards: ${title}`,
        mindmapId: mindmap.id,
        cards,
      });
      deckId = deck.id;
    }

    this.logger.log(
      `PDF ingest: user=${userId} pages=${pageCount} chars=${text.length} ` +
        `mindmap=${mindmap.id} cards=${cards.length}`,
    );

    return {
      mindmapId: mindmap.id,
      deckId,
      title,
      cardCount: cards.length,
      meta: {
        pageCount,
        textLength: text.length,
        models: { mindmap: mmRes.model, flashcard: fcRes.model },
      },
    };
  }

  /** Run a domain validator, translating PdfValidationError into a 400. */
  private toBadRequest(fn: () => void): void {
    try {
      fn();
    } catch (err) {
      if (err instanceof PdfValidationError) {
        throw new BadRequestException({ code: err.code, message: err.message });
      }
      throw err;
    }
  }

  /** Parse AI JSON, translating malformed output into a 400 (not a 500). */
  private parse(content: string): unknown {
    try {
      return parseAiJson(content);
    } catch {
      throw new BadRequestException({
        code: 'AI_OUTPUT_INVALID',
        message: 'AI trả về dữ liệu không hợp lệ. Vui lòng thử lại.',
      });
    }
  }
}
