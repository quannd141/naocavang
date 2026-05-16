import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PasswordHasher } from '../infrastructure/password-hasher';
import type { LoginDto } from '../presentation/dto/login.dto';

export interface LoginResult {
  token: string;
  expiresAt: string;
  user: { id: string; email: string; name: string; tier: string };
}

/** 30-day session lifetime — matches NextAuth default. */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(dto: LoginDto): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    const ok = await this.hasher.verify(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + SESSION_TTL_MS);
    await this.prisma.session.create({
      data: { sessionToken: token, userId: user.id, expires },
    });

    this.logger.log(`Login OK userId=${user.id}`);
    return {
      token,
      expiresAt: expires.toISOString(),
      user: { id: user.id, email: user.email, name: user.name, tier: user.tier },
    };
  }

  async logout(token: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { sessionToken: token } });
  }
}
