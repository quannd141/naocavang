import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import type { AuthedUser } from '../../auth/infrastructure/session-auth.guard';
import { SessionAuthGuard } from '../../auth/infrastructure/session-auth.guard';
import { MindMapService } from '../application/mindmap.service';
import { CreateMindMapDto, UpdateMindMapDto } from './dto/mindmap.dto';

@ApiTags('mindmaps')
@Controller('mindmaps')
@UseGuards(SessionAuthGuard)
@ApiBearerAuth()
export class MindMapController {
  constructor(private readonly service: MindMapService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách mind map của user hiện tại' })
  async list(@CurrentUser() user: AuthedUser) {
    const items = await this.service.listMine(user.id);
    return { success: true, data: items };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết mind map (chỉ owner hoặc public)' })
  async getOne(@Param('id') id: string, @CurrentUser() user: AuthedUser) {
    const mm = await this.service.getById(id, user.id);
    return { success: true, data: mm };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo mind map mới (blank hoặc copy data)' })
  async create(@Body() dto: CreateMindMapDto, @CurrentUser() user: AuthedUser) {
    const mm = await this.service.create(user.id, dto);
    return { success: true, data: mm };
  }

  @Post('from-template/:templateId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo mind map từ template — copy data và tăng useCount' })
  async createFromTemplate(
    @Param('templateId') templateId: string,
    @CurrentUser() user: AuthedUser,
  ) {
    const mm = await this.service.createFromTemplate(user.id, templateId);
    return { success: true, data: mm };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update mind map (title/data/tags/isPublic)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMindMapDto,
    @CurrentUser() user: AuthedUser,
  ) {
    const mm = await this.service.update(id, user.id, dto);
    return { success: true, data: mm };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xoá mind map (chỉ owner)' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthedUser) {
    await this.service.delete(id, user.id);
  }

  @Get('public/list')
  @ApiOperation({ summary: 'Danh sách mind map public (gallery)' })
  async publicList(@Query('limit') _limit?: string) {
    // future improvement: remove guard at method level via SkipAuth decorator
    return { success: true, data: [], note: 'TODO: implement public list' };
  }
}
