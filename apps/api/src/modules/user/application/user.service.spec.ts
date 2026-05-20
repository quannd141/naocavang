import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { UserService } from './user.service';

type AnyFn = (...args: unknown[]) => unknown;
type Mock = ReturnType<typeof vi.fn<AnyFn>>;

interface UserRepoMock {
  findById: Mock;
  findByEmail: Mock;
  incrementAiQuotaUsed: Mock;
}
interface PrismaMock {
  user: { findUnique: Mock; update: Mock; delete: Mock };
  session: { deleteMany: Mock };
}
interface HasherMock {
  hash: Mock;
  verify: Mock;
}

function makeMocks() {
  const repo: UserRepoMock = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    incrementAiQuotaUsed: vi.fn(),
  };
  const prisma: PrismaMock = {
    user: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    session: { deleteMany: vi.fn() },
  };
  const hasher: HasherMock = { hash: vi.fn(), verify: vi.fn() };
  const service = new UserService(
    repo as unknown as never,
    prisma as unknown as never,
    hasher as unknown as never,
  );
  return { service, repo, prisma, hasher };
}

const USER_FIXTURE = {
  id: 'u1',
  email: 'u@e.com',
  name: 'Old Name',
  avatarUrl: null,
  tier: 'free',
  aiQuotaRemaining: 50,
  isEmailVerified: false,
};

describe('UserService.updateName', () => {
  it('trims + persists + reloads', async () => {
    const { service, repo, prisma } = makeMocks();
    prisma.user.update.mockResolvedValue({});
    repo.findById.mockResolvedValue({ ...USER_FIXTURE, name: 'New' });

    const result = await service.updateName('u1', '  New  ');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { name: 'New' },
    });
    expect(result.name).toBe('New');
  });

  it('rejects whitespace-only name', async () => {
    const { service } = makeMocks();
    await expect(service.updateName('u1', '   ')).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('UserService.changePassword', () => {
  it('verifies old, hashes new, invalidates sessions', async () => {
    const { service, prisma, hasher } = makeMocks();
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: 'OLD_HASH' });
    hasher.verify.mockResolvedValue(true);
    hasher.hash.mockResolvedValue('NEW_HASH');
    prisma.user.update.mockResolvedValue({});
    prisma.session.deleteMany.mockResolvedValue({ count: 3 });

    await service.changePassword('u1', 'oldpw', 'newpassword');

    expect(hasher.verify).toHaveBeenCalledWith('oldpw', 'OLD_HASH');
    expect(hasher.hash).toHaveBeenCalledWith('newpassword');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { passwordHash: 'NEW_HASH' },
    });
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u1' } });
  });

  it('throws WRONG_OLD_PASSWORD when old does not match', async () => {
    const { service, prisma, hasher } = makeMocks();
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: 'OLD_HASH' });
    hasher.verify.mockResolvedValue(false);

    await expect(service.changePassword('u1', 'wrong', 'newpassword')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.session.deleteMany).not.toHaveBeenCalled();
  });

  it('throws NotFound when user gone', async () => {
    const { service, prisma } = makeMocks();
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.changePassword('missing', 'a', 'bbbbbbbb')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws NO_PASSWORD_SET for OAuth-only users (no passwordHash)', async () => {
    const { service, prisma } = makeMocks();
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: null });
    await expect(service.changePassword('u1', 'a', 'bbbbbbbb')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

describe('UserService.deleteAccount', () => {
  it('verifies password then cascade-deletes for password-auth user', async () => {
    const { service, prisma, hasher } = makeMocks();
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: 'HASH' });
    hasher.verify.mockResolvedValue(true);
    prisma.user.delete.mockResolvedValue({});

    await service.deleteAccount('u1', 'mypw');

    expect(hasher.verify).toHaveBeenCalledWith('mypw', 'HASH');
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });

  it('rejects when password missing on password-auth user', async () => {
    const { service, prisma } = makeMocks();
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: 'HASH' });

    await expect(service.deleteAccount('u1', undefined)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('rejects when password wrong', async () => {
    const { service, prisma, hasher } = makeMocks();
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: 'HASH' });
    hasher.verify.mockResolvedValue(false);

    await expect(service.deleteAccount('u1', 'wrong')).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('skips password check for OAuth-only user (no passwordHash)', async () => {
    const { service, prisma, hasher } = makeMocks();
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: null });
    prisma.user.delete.mockResolvedValue({});

    await service.deleteAccount('u1', undefined);

    expect(hasher.verify).not.toHaveBeenCalled();
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });

  it('throws NotFound when user gone', async () => {
    const { service, prisma } = makeMocks();
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.deleteAccount('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
