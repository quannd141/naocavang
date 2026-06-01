import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { TutorService } from './application/tutor.service';
import { TutorController } from './presentation/tutor.controller';

@Module({
  imports: [AiModule, AuthModule],
  controllers: [TutorController],
  providers: [TutorService],
})
export class TutorModule {}
