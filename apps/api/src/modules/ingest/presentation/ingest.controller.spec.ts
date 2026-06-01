import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IngestController } from './ingest.controller';

const USER = { id: 'user-1', email: 'a@b.c', name: 'A', tier: 'free', role: null };

describe('IngestController.uploadPdf', () => {
  let ingest: { ingestPdf: ReturnType<typeof vi.fn> };
  let controller: IngestController;

  beforeEach(() => {
    ingest = { ingestPdf: vi.fn().mockResolvedValue({ mindmapId: 'mm-1', deckId: 'd-1' }) };
    controller = new IngestController(ingest as never);
  });

  it('rejects a request with no file', async () => {
    await expect(controller.uploadPdf(undefined, {}, USER)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(ingest.ingestPdf).not.toHaveBeenCalled();
  });

  it('delegates to the service and wraps the result in the success envelope', async () => {
    const file = {
      buffer: Buffer.from('%PDF'),
      mimetype: 'application/pdf',
      size: 4,
      originalname: 'x.pdf',
    };
    const res = await controller.uploadPdf(file, { subject: 'math' }, USER);

    expect(res).toEqual({ success: true, data: { mindmapId: 'mm-1', deckId: 'd-1' } });
    expect(ingest.ingestPdf).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ mimetype: 'application/pdf', originalname: 'x.pdf' }),
      { title: undefined, subject: 'math' },
    );
  });
});
