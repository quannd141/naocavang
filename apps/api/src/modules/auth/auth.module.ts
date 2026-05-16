import { Module } from '@nestjs/common';
import { LoginService } from './application/login.service';
import { RegisterService } from './application/register.service';
import { PasswordHasher } from './infrastructure/password-hasher';
import { SessionAuthGuard } from './infrastructure/session-auth.guard';
import { AuthController } from './presentation/auth.controller';

@Module({
  controllers: [AuthController],
  providers: [RegisterService, LoginService, PasswordHasher, SessionAuthGuard],
  exports: [RegisterService, LoginService, SessionAuthGuard, PasswordHasher],
})
export class AuthModule {}
