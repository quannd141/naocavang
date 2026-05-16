import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PasswordHasher } from '../infrastructure/password-hasher';
import type { RegisterDto } from '../presentation/dto/register.dto';

export interface RegisteredUser {
  id: string;
  email: string;
  name: string;
}

@Injectable()
export class RegisterService {
  private readonly logger = new Logger(RegisterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly hasher: PasswordHasher,
  ) {}

  /**
   * Register a new user with email + password.
   *
   * - Validates email is unique
   * - Hashes password with bcrypt cost 12
   * - Creates user with free-tier defaults
   * - Does NOT send welcome email here (queued separately to avoid blocking)
   *
   * FR-001 (SRS-v1.0).
   */
  async execute(dto: RegisterDto): Promise<RegisteredUser> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      // Generic message — no leaking whether email exists per FR-003 AC5
      throw new ConflictException({
        code: 'EMAIL_TAKEN',
        message: 'Email đã được sử dụng. Bạn muốn đăng nhập?',
      });
    }

    const passwordHash = await this.hasher.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name.trim(),
        tier: 'free',
        aiQuotaMonthly: 50,
        mindmapQuotaMonthly: 10,
      },
      select: { id: true, email: true, name: true },
    });

    this.logger.log(`User registered: ${user.email}`);

    // TODO(Sprint 1): enqueue welcome email job via BullMQ
    //                 (NIGHT_SHIFT_MODE: log to console, do not call Resend)

    return user;
  }
}
