import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { UserRepository } from '../infrastructure/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
}
