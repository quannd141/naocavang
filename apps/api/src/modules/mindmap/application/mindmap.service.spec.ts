import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { MindMapService } from './mindmap.service';

type AnyFn = (...args: unknown[]) => unknown;
type Mock = ReturnType<typeof vi.fn<AnyFn>>;

interface PrismaMock {
  mindMap: { findUnique: Mock; create: Mock };
}

function makeMocks() {
  const prisma: PrismaMock = {
    mindMap: { findUnique: vi.fn(), create: vi.fn() },
  };
  const service = new MindMapService(prisma as unknown as never);
  return { service, prisma };
}

const SOURCE = {
  id: 'mm1',
  userId: 'owner-uid',
  title: 'Hệ tuần hoàn',
  description: 'desc',
  data: { nodes: [{ id: 'root', data: { label: 'Tim' } }], edges: [] },
  subject: 'biology',
  tags: ['lop8'],
  isPublic: false,
  sourceTemplateId: null,
  sourceType: 'manual',
  createdAt: new Date('2026-05-01'),
  updatedAt: new Date('2026-05-02'),
};

describe('MindMapService.clone', () => {
  it('owner can clone own private mindmap — title gets (sao chép) suffix', async () => {
    const { service, prisma } = makeMocks();
    prisma.mindMap.findUnique.mockResolvedValue(SOURCE);
    prisma.mindMap.create.mockImplementation((args) => {
      const a = args as { data: Record<string, unknown> };
      return Promise.resolve({ id: 'mm2', ...a.data });
    });

    const copy = await service.clone('mm1', 'owner-uid');

    expect(prisma.mindMap.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'owner-uid',
          title: 'Hệ tuần hoàn (sao chép)',
          subject: 'biology',
          tags: ['lop8'],
          isPublic: false,
          sourceType: 'manual',
          sourceTemplateId: null,
        }),
      }),
    );
    expect(copy.id).toBe('mm2');
  });

  it('non-owner can clone a public mindmap (fork-on-write)', async () => {
    const { service, prisma } = makeMocks();
    prisma.mindMap.findUnique.mockResolvedValue({ ...SOURCE, isPublic: true });
    prisma.mindMap.create.mockImplementation((args) => {
      const a = args as { data: Record<string, unknown> };
      return Promise.resolve({ id: 'mm-fork', ...a.data });
    });

    const copy = await service.clone('mm1', 'other-uid');

    expect(prisma.mindMap.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'other-uid', isPublic: false }),
      }),
    );
    expect(copy.id).toBe('mm-fork');
  });

  it('non-owner cannot clone a private mindmap', async () => {
    const { service, prisma } = makeMocks();
    prisma.mindMap.findUnique.mockResolvedValue(SOURCE);
    await expect(service.clone('mm1', 'other-uid')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.mindMap.create).not.toHaveBeenCalled();
  });

  it('throws NotFound when source missing', async () => {
    const { service, prisma } = makeMocks();
    prisma.mindMap.findUnique.mockResolvedValue(null);
    await expect(service.clone('missing', 'uid')).rejects.toBeInstanceOf(NotFoundException);
  });
});
