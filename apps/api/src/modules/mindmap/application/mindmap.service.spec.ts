import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { MindMapService } from './mindmap.service';

type AnyFn = (...args: unknown[]) => unknown;
type Mock = ReturnType<typeof vi.fn<AnyFn>>;

interface PrismaMock {
  mindMap: { findUnique: Mock; create: Mock; findMany: Mock };
}

function makeMocks() {
  const prisma: PrismaMock = {
    mindMap: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() },
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

describe('MindMapService.listPublic', () => {
  const PUBLIC_ROW = {
    id: 'pub1',
    title: 'Quang hợp',
    description: 'desc',
    subject: 'biology',
    tags: ['lop11'],
    createdAt: new Date('2026-05-01'),
    updatedAt: new Date('2026-05-10'),
    user: { name: 'Cô Lan' },
  };

  it('returns only public maps mapped with authorName, default limit 20, newest first', async () => {
    const { service, prisma } = makeMocks();
    prisma.mindMap.findMany.mockResolvedValue([PUBLIC_ROW]);

    const result = await service.listPublic();

    expect(prisma.mindMap.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPublic: true },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
    );
    expect(result).toEqual([
      {
        id: 'pub1',
        title: 'Quang hợp',
        description: 'desc',
        subject: 'biology',
        tags: ['lop11'],
        createdAt: PUBLIC_ROW.createdAt,
        updatedAt: PUBLIC_ROW.updatedAt,
        authorName: 'Cô Lan',
      },
    ]);
    // The nested user object must not leak through.
    expect((result[0] as Record<string, unknown>).user).toBeUndefined();
  });

  it('filters by subject when provided', async () => {
    const { service, prisma } = makeMocks();
    prisma.mindMap.findMany.mockResolvedValue([]);

    await service.listPublic({ subject: 'math' });

    expect(prisma.mindMap.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isPublic: true, subject: 'math' },
      }),
    );
  });

  it('clamps limit to a max of 50', async () => {
    const { service, prisma } = makeMocks();
    prisma.mindMap.findMany.mockResolvedValue([]);

    await service.listPublic({ limit: 999 });

    expect(prisma.mindMap.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 }),
    );
  });

  it('falls back to default 20 for invalid (<=0 or NaN) limits', async () => {
    const { service, prisma } = makeMocks();
    prisma.mindMap.findMany.mockResolvedValue([]);

    await service.listPublic({ limit: 0 });
    await service.listPublic({ limit: Number.NaN });
    await service.listPublic({ limit: -5 });

    for (const call of prisma.mindMap.findMany.mock.calls) {
      expect((call[0] as { take: number }).take).toBe(20);
    }
  });
});
