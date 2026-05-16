import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { RegisterService } from './application/register.service';
import { AuthController } from './presentation/auth.controller';
import { PasswordHasher } from './infrastructure/password-hasher';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [RegisterService, PasswordHasher],
  exports: [RegisterService],
})
export class AuthModule {}
