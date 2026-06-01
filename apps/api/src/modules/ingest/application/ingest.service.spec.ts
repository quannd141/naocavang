import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PdfExtractor } from '../domain/ports/pdf-extractor.port';
import { type IngestFile, IngestService } from './ingest.service';

const MINDMAP_JSON = JSON.stringify({
  rootId: 'root',
  nodes: {
    root: { id: 'root', text: 'Chủ đề', parentId: null },
    n1: { id: 'n1', text: 'Ý 1', parentId: 'root' },
  },
  edges: [{ source: 'root', target: 'n1' }],
});
const FLASHCARD_JSON = JSON.stringify({
  cards: [{ question: 'Q1', answer: 'A1', format: 'qa' }],
});

function makeFile(over: Partial<IngestFile> = {}): IngestFile {
  return {
    buffer: Buffer.from('%PDF-1.4'),
    mimetype: 'application/pdf',
    size: 1024,
    originalname: 'bai-hoc.pdf',
    ...over,
  };
}

describe('IngestService.ingestPdf', () => {
  let extractor: PdfExtractor;
  let ai: { generate: ReturnType<typeof vi.fn> };
  let mindmaps: { createFromIngest: ReturnType<typeof vi.fn> };
  let flashcards: { createDeck: ReturnType<typeof vi.fn> };
  let service: IngestService;

  beforeEach(() => {
    extractor = { extract: vi.fn().mockResolvedValue({ text: 'x'.repeat(200), pageCount: 3 }) };
    ai = {
      generate: vi
        .fn()
        .mockResolvedValueOnce({ content: MINDMAP_JSON, model: 'mock', costUsd: 0 })
        .mockResolvedValueOnce({ content: FLASHCARD_JSON, model: 'mock', costUsd: 0 }),
    };
    mindmaps = { createFromIngest: vi.fn().mockResolvedValue({ id: 'mm-1' }) };
    flashcards = { createDeck: vi.fn().mockResolvedValue({ id: 'deck-1' }) };
    service = new IngestService(extractor, ai as never, mindmaps as never, flashcards as never);
  });

  it('creates a mind map + deck from a valid PDF', async () => {
    const result = await service.ingestPdf('user-1', makeFile());

    expect(result.mindmapId).toBe('mm-1');
    expect(result.deckId).toBe('deck-1');
    expect(result.cardCount).toBe(1);
    expect(result.title).toBe('bai-hoc');
    expect(result.meta.pageCount).toBe(3);
  });

  it('stamps sourceType via createFromIngest and links the deck to the new mind map', async () => {
    await service.ingestPdf('user-1', makeFile());
    expect(mindmaps.createFromIngest).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ title: 'bai-hoc' }),
    );
    expect(flashcards.createDeck).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ mindmapId: 'mm-1' }),
    );
  });

  it('honours an explicit title and subject override', async () => {
    const result = await service.ingestPdf('user-1', makeFile(), {
      title: '  Sinh học 12  ',
      subject: 'biology',
    });
    expect(result.title).toBe('Sinh học 12');
    expect(mindmaps.createFromIngest).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ subject: 'biology' }),
    );
  });

  it('rejects a non-PDF upload with 400', async () => {
    await expect(
      service.ingestPdf('user-1', makeFile({ mimetype: 'image/png' })),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(ai.generate).not.toHaveBeenCalled();
  });

  it('rejects when extracted text is too short (scanned PDF)', async () => {
    (extractor.extract as ReturnType<typeof vi.fn>).mockResolvedValue({ text: 'hi', pageCount: 1 });
    await expect(service.ingestPdf('user-1', makeFile())).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(ai.generate).not.toHaveBeenCalled();
  });

  it('throws EMPTY_MINDMAP when the AI yields no nodes', async () => {
    ai.generate = vi
      .fn()
      .mockResolvedValueOnce({ content: JSON.stringify({ nodes: {} }), model: 'mock' });
    await expect(service.ingestPdf('user-1', makeFile())).rejects.toMatchObject({
      response: { code: 'EMPTY_MINDMAP' },
    });
    expect(mindmaps.createFromIngest).not.toHaveBeenCalled();
  });

  it('maps invalid AI JSON to AI_OUTPUT_INVALID (400, not 500)', async () => {
    ai.generate = vi.fn().mockResolvedValueOnce({ content: '{not json', model: 'mock' });
    await expect(service.ingestPdf('user-1', makeFile())).rejects.toMatchObject({
      response: { code: 'AI_OUTPUT_INVALID' },
    });
  });

  it('still returns the mind map when no flashcards are generated', async () => {
    ai.generate = vi
      .fn()
      .mockResolvedValueOnce({ content: MINDMAP_JSON, model: 'mock' })
      .mockResolvedValueOnce({ content: JSON.stringify({ cards: [] }), model: 'mock' });
    const result = await service.ingestPdf('user-1', makeFile());
    expect(result.mindmapId).toBe('mm-1');
    expect(result.deckId).toBeNull();
    expect(result.cardCount).toBe(0);
    expect(flashcards.createDeck).not.toHaveBeenCalled();
  });
});
