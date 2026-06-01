import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReminderService } from './application/reminder.service';
import { EMAIL_PORT } from './domain/ports/email.port';
import { MockEmailAdapter } from './infrastructure/mock-email.adapter';
import { ReminderController } from './presentation/reminder.controller';

@Module({
  imports: [AuthModule],
  controllers: [ReminderController],
  providers: [
    ReminderService,
    // Mock adapter while NIGHT_SHIFT_MODE / no provider key (PH-005).
    // Swap for ResendEmailAdapter via a useFactory when credentials exist.
    { provide: EMAIL_PORT, useClass: MockEmailAdapter },
  ],
})
export class ReminderModule {}
