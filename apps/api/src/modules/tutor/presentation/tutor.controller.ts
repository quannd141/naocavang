import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthedUser } from '../../auth/infrastructure/session-auth.guard';
import { SessionAuthGuard } from '../../auth/infrastructure/session-auth.guard';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import { TutorService } from '../application/tutor.service';
import { TutorChatDto } from './dto/tutor.dto';

@ApiTags('tutor')
@Controller('tutor')
@UseGuards(SessionAuthGuard)
@ApiBearerAuth()
export class TutorController {
  constructor(private readonly tutor: TutorService) {}

  @Post('chat')
  @ApiOperation({
    summary: 'Hỏi Cá Vàng GPT (mock khi NIGHT_SHIFT_MODE=true). Trả về full answer.',
  })
  async chat(@Body() dto: TutorChatDto, @CurrentUser() user: AuthedUser) {
    const result = await this.tutor.ask(user.id, dto.question, {
      topicTitle: dto.topicTitle,
      subject: dto.subject,
    });
    return { success: true, data: result };
  }
}
