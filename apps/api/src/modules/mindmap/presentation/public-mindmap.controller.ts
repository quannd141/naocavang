import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { clampLimit, MindMapService } from '../application/mindmap.service';

@ApiTags('public')
@Controller('public/mindmaps')
export class PublicMindMapController {
  constructor(private readonly service: MindMapService) {}

  @Get()
  @ApiOperation({
    summary: 'Public gallery — list public mind maps (newest first), optional ?subject= & ?limit=',
  })
  async list(@Query('limit') limit?: string, @Query('subject') subject?: string) {
    const items = await this.service.listPublic({
      limit: limit !== undefined ? clampLimit(Number(limit)) : undefined,
      subject: subject || undefined,
    });
    return { success: true, data: items };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Read a mind map without auth — only returns mind maps with isPublic=true',
  })
  async getOne(@Param('id') id: string) {
    const mm = await this.service.getPublic(id);
    return { success: true, data: mm };
  }
}
