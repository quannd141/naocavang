import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { User } from '../domain/user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  async incrementAiQuotaUsed(userId: string, amount: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { aiQuotaUsed: { increment: amount } },
    });
  }

  async resetMonthlyQuotas(): Promise<number> {
    const result = await this.prisma.user.updateMany({
      data: { aiQuotaUsed: 0 },
    });
    return result.count;
  }

  // biome-ignore lint/suspicious/noExplicitAny: Prisma generated type — mapped to domain
  private toDomain(record: any): User {
    return new User({
      id: record.id,
      email: record.email,
      name: record.name,
      avatarUrl: record.avatarUrl,
      tier: record.tier,
      aiQuotaMonthly: record.aiQuotaMonthly,
      aiQuotaUsed: record.aiQuotaUsed,
      mindmapQuotaMonthly: record.mindmapQuotaMonthly,
      emailVerifiedAt: record.emailVerifiedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
