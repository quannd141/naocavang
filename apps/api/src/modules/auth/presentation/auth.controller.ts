import { Body, Controller, Delete, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LoginService } from '../application/login.service';
import { RegisterService } from '../application/register.service';
import { SessionAuthGuard } from '../infrastructure/session-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { SessionToken } from './decorators/session-token.decorator';
import type { AuthedUser } from '../infrastructure/session-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly loginService: LoginService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60 * 60 * 1000 } })
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

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Đăng nhập, trả về session token' })
  @ApiResponse({ status: 200, description: 'OK — token + user info' })
  @ApiResponse({ status: 401, description: 'Sai email hoặc mật khẩu' })
  async login(@Body() dto: LoginDto) {
    const result = await this.loginService.execute(dto);
    return { success: true, data: result };
  }

  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SessionAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất — vô hiệu hoá session token hiện tại' })
  async logout(@CurrentUser() _user: AuthedUser, @SessionToken() token: string) {
    await this.loginService.logout(token);
    return { success: true };
  }
}
