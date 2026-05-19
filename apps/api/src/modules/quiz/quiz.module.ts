import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { QuizService } from './application/quiz.service';
import { QuizController } from './presentation/quiz.controller';

/** Quiz module — FR-050 take + FR-051 auto-add wrong answers to flashcard. */
@Module({
  imports: [AuthModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
