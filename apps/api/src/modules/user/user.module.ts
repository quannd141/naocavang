import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ExportService } from './application/export.service';
import { StatsService } from './application/stats.service';
import { UserService } from './application/user.service';
import { UserRepository } from './infrastructure/user.repository';
import { UserController } from './presentation/user.controller';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, StatsService, ExportService],
  exports: [UserService, UserRepository],
})
export class UserModule {}
