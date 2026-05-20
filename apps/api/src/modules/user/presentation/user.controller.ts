import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import type { AuthedUser } from '../../auth/infrastructure/session-auth.guard';
import { SessionAuthGuard } from '../../auth/infrastructure/session-auth.guard';
import { ExportService } from '../application/export.service';
import { StatsService } from '../application/stats.service';
import { UserService } from '../application/user.service';
import { ChangePasswordDto, DeleteAccountDto, UpdateMeDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(SessionAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly statsService: StatsService,
    private readonly exportService: ExportService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại + quota AI còn lại' })
  async me(@CurrentUser() current: AuthedUser) {
    const user = await this.userService.findById(current.id);
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        tier: user.tier,
        aiQuotaRemaining: user.aiQuotaRemaining,
        emailVerified: user.isEmailVerified,
      },
    };
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Dashboard stats: counts, due cards, streak, recent items' })
  async stats(@CurrentUser() current: AuthedUser) {
    const stats = await this.statsService.getUserStats(current.id);
    return { success: true, data: stats };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update self profile (only name editable for now)' })
  async updateMe(@Body() dto: UpdateMeDto, @CurrentUser() current: AuthedUser) {
    const user = await this.userService.updateName(current.id, dto.name);
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        tier: user.tier,
      },
    };
  }

  @Get('me/export')
  @ApiOperation({
    summary:
      'Export all user data (mindmaps + decks + quizzes + attempts) as JSON — PDPA compliance',
  })
  async exportData(@CurrentUser() current: AuthedUser) {
    const data = await this.exportService.exportUserData(current.id);
    return { success: true, data };
  }

  @Post('me/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Change password. Requires oldPassword. Invalidates all sessions on success.',
  })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() current: AuthedUser,
  ): Promise<void> {
    await this.userService.changePassword(current.id, dto.oldPassword, dto.newPassword);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Permanently delete account + all owned data (PDPA right to be forgotten). Password required for password-auth accounts.',
  })
  async deleteAccount(
    @Body() dto: DeleteAccountDto,
    @CurrentUser() current: AuthedUser,
  ): Promise<void> {
    await this.userService.deleteAccount(current.id, dto.password);
  }
}
