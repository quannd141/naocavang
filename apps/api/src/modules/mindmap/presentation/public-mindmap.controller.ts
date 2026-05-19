import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MindMapService } from '../application/mindmap.service';

@ApiTags('public')
@Controller('public/mindmaps')
export class PublicMindMapController {
  constructor(private readonly service: MindMapService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Read a mind map without auth — only returns mind maps with isPublic=true',
  })
  async getOne(@Param('id') id: string) {
    const mm = await this.service.getPublic(id);
    return { success: true, data: mm };
  }
}
