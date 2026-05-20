import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PasswordHasher } from '../../auth/infrastructure/password-hasher';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import type { User } from '../domain/user.entity';
import { UserRepository } from '../infrastructure/user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
    private readonly hasher: PasswordHasher,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Check if user has remaining AI quota for the month.
   * Used by AI generation endpoints before calling provider.
   */
  async hasAiQuota(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    return user.aiQuotaRemaining > 0;
  }

  async decrementAiQuota(userId: string): Promise<void> {
    await this.userRepository.incrementAiQuotaUsed(userId, 1);
  }

  /** Update display name (the only profile field user can self-edit). */
  async updateName(userId: string, name: string): Promise<User> {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new BadRequestException({ code: 'INVALID_NAME', message: 'Tên không được trống' });
    }
    await this.prisma.user.update({ where: { id: userId }, data: { name: trimmed } });
    return this.findById(userId);
  }

  /**
   * Verify oldPassword then hash + store newPassword.
   * Invalidates all other sessions of the user to force re-login.
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const record = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!record) throw new NotFoundException({ code: 'USER_NOT_FOUND' });
    if (!record.passwordHash) {
      throw new BadRequestException({
        code: 'NO_PASSWORD_SET',
        message: 'Tài khoản này đăng nhập qua OAuth — chưa có password để đổi',
      });
    }
    const ok = await this.hasher.verify(oldPassword, record.passwordHash);
    if (!ok) {
      throw new BadRequestException({
        code: 'WRONG_OLD_PASSWORD',
        message: 'Mật khẩu cũ không đúng',
      });
    }
    const newHash = await this.hasher.hash(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
    // Best practice: invalidate other sessions when password changes.
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  /**
   * Permanently delete the user and every owned record (cascade).
   * Requires password confirmation for password-auth accounts to prevent
   * accidental + stolen-session deletion. OAuth-only accounts skip the check
   * since they have no password to verify against.
   */
  async deleteAccount(userId: string, passwordConfirmation?: string): Promise<void> {
    const record = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!record) throw new NotFoundException({ code: 'USER_NOT_FOUND' });
    if (record.passwordHash) {
      if (!passwordConfirmation) {
        throw new BadRequestException({
          code: 'PASSWORD_REQUIRED',
          message: 'Cần nhập mật khẩu để xác nhận xoá tài khoản',
        });
      }
      const ok = await this.hasher.verify(passwordConfirmation, record.passwordHash);
      if (!ok) {
        throw new BadRequestException({
          code: 'WRONG_PASSWORD',
          message: 'Mật khẩu không đúng',
        });
      }
    }
    // Cascade-delete handled by schema (sessions, mindmaps, decks, attempts, logs).
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
