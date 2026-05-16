import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RegisterService } from '../application/register.service';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } }) // 5/hour per IP — FR-001 AC8
  @ApiOperation({ summary: 'Đăng ký user mới' })
  @ApiResponse({ status: 201, description: 'Tạo user thành công' })
  @ApiResponse({ status: 409, description: 'Email đã được sử dụng' })
  async register(@Body() dto: RegisterDto): Promise<{
    success: true;
    data: { id: string; email: string; name: string };
  }> {
    const user = await this.registerService.execute(dto);
    return { success: true, data: user };
  }
}
