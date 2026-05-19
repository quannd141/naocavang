import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FlashcardService } from './application/flashcard.service';
import { FlashcardController } from './presentation/flashcard.controller';

/** Flashcard module — FR-030 deck CRUD + FR-031 SM-2 review (ADR-004). */
@Module({
  imports: [AuthModule],
  controllers: [FlashcardController],
  providers: [FlashcardService],
  exports: [FlashcardService],
})
export class FlashcardModule {}
