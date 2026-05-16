import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export interface AuthedUser {
  id: string;
  email: string;
  name: string;
  tier: string;
  role: string | null;
}

export interface AuthedRequest extends Request {
  user?: AuthedUser;
  sessionToken?: string;
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.header('authorization') ?? req.header('Authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) throw new UnauthorizedException({ code: 'NO_TOKEN', message: 'Cần đăng nhập' });

    const session = await this.prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });
    if (!session || session.expires.getTime() < Date.now()) {
      throw new UnauthorizedException({ code: 'INVALID_TOKEN', message: 'Phiên đăng nhập hết hạn' });
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      tier: session.user.tier,
      role: session.user.role,
    };
    req.sessionToken = token;
    return true;
  }
}
