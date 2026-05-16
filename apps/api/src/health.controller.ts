import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class HealthController {
  @Get('health')
  health(): { status: 'ok'; uptime: number; nightShift: boolean } {
    return {
      status: 'ok',
      uptime: process.uptime(),
      nightShift: process.env.NIGHT_SHIFT_MODE === 'true',
    };
  }

  @Get('ready')
  ready(): { status: 'ready' } {
    return { status: 'ready' };
  }
}
