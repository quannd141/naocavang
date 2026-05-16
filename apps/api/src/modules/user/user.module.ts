import { Module } from '@nestjs/common';
import { UserRepository } from './infrastructure/user.repository';
import { UserService } from './application/user.service';

@Module({
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
