import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import type { AuthedUser } from '../../auth/infrastructure/session-auth.guard';
import { SessionAuthGuard } from '../../auth/infrastructure/session-auth.guard';
import { AiRoutingService } from '../application/ai-routing.service';
import { GenerateMindMapDto } from './dto/generate.dto';

@ApiTags('ai')
@Controller('ai')
@UseGuards(SessionAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly routing: AiRoutingService) {}

  @Post('generate/mindmap')
  @ApiOperation({
    summary: 'Sinh mind map từ text (mock khi NIGHT_SHIFT_MODE=true, real Gemini khi false)',
  })
  async generateMindMap(@Body() dto: GenerateMindMapDto, @CurrentUser() user: AuthedUser) {
    const result = await this.routing.generate({
      userId: user.id,
      task: 'mindmap_gen',
      prompt: dto.prompt,
      systemPrompt: 'Bạn là AI giáo viên VN. Trả về JSON mind map theo schema.',
      jsonMode: true,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(result.content);
    } catch {
      parsed = { raw: result.content };
    }

    return {
      success: true,
      data: {
        mindmap: parsed,
        meta: {
          model: result.model,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          latencyMs: result.latencyMs,
          costUsd: result.costUsd,
        },
      },
    };
  }
}
