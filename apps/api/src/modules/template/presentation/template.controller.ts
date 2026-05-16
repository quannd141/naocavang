import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@ApiTags('templates')
@Controller('templates')
export class TemplateController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách template công khai (filter theo subject/grade tuỳ chọn)' })
  async list(@Query('subject') subject?: string, @Query('grade') grade?: string) {
    const items = await this.prisma.template.findMany({
      where: {
        ...(subject ? { subject: subject as never } : {}),
        ...(grade ? { gradeLevel: grade } : {}),
      },
      orderBy: { useCount: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        gradeLevel: true,
        tags: true,
        authorName: true,
        useCount: true,
        likeCount: true,
        createdAt: true,
      },
    });
    return { success: true, data: items };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết 1 template — gồm data mind map' })
  async getOne(@Param('id') id: string) {
    const tmpl = await this.prisma.template.findUnique({ where: { id } });
    if (!tmpl) throw new NotFoundException({ code: 'TEMPLATE_NOT_FOUND' });
    return { success: true, data: tmpl };
  }
}
