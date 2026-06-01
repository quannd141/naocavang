import { Controller, ForbiddenException, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthedUser } from '../../auth/infrastructure/session-auth.guard';
import { SessionAuthGuard } from '../../auth/infrastructure/session-auth.guard';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import { ReminderService } from '../application/reminder.service';

@ApiTags('reminders')
@Controller('reminders')
@UseGuards(SessionAuthGuard)
@ApiBearerAuth()
export class ReminderController {
  constructor(private readonly reminder: ReminderService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger the daily reminder digest now (admin only — dev/ops)' })
  async run(@CurrentUser() user: AuthedUser) {
    if (user.tier !== 'admin' && user.role !== 'admin') {
      throw new ForbiddenException({ code: 'ADMIN_ONLY' });
    }
    const result = await this.reminder.runDailyDigest();
    return { success: true, data: result };
  }
}
