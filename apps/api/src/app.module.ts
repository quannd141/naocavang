import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './health.controller';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';
import { FlashcardModule } from './modules/flashcard/flashcard.module';
import { IngestModule } from './modules/ingest/ingest.module';
import { MindmapModule } from './modules/mindmap/mindmap.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { TemplateModule } from './modules/template/template.module';
import { TutorModule } from './modules/tutor/tutor.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    MindmapModule,
    TemplateModule,
    AiModule,
    FlashcardModule,
    QuizModule,
    TutorModule,
    ReminderModule,
    IngestModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
