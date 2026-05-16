import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import type { CreateMindMapDto, UpdateMindMapDto } from '../presentation/dto/mindmap.dto';

@Injectable()
export class MindMapService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(userId: string) {
    return this.prisma.mindMap.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        tags: true,
        isPublic: true,
        sourceType: true,
        sourceTemplateId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getById(id: string, userId: string) {
    const mm = await this.prisma.mindMap.findUnique({ where: { id } });
    if (!mm) throw new NotFoundException({ code: 'MINDMAP_NOT_FOUND' });
    if (!mm.isPublic && mm.userId !== userId) {
      throw new ForbiddenException({ code: 'MINDMAP_ACCESS_DENIED' });
    }
    return mm;
  }

  async create(userId: string, dto: CreateMindMapDto) {
    return this.prisma.mindMap.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description ?? null,
        data: dto.data as never,
        subject: (dto.subject as never) ?? null,
        tags: dto.tags ?? [],
        sourceTemplateId: dto.sourceTemplateId ?? null,
        sourceType: dto.sourceTemplateId ? 'template' : 'manual',
      },
    });
  }

  async createFromTemplate(userId: string, templateId: string) {
    const tmpl = await this.prisma.template.findUnique({ where: { id: templateId } });
    if (!tmpl) throw new NotFoundException({ code: 'TEMPLATE_NOT_FOUND' });
    const mm = await this.prisma.mindMap.create({
      data: {
        userId,
        title: tmpl.title,
        description: tmpl.description,
        data: tmpl.data as never,
        subject: tmpl.subject,
        tags: tmpl.tags,
        sourceTemplateId: tmpl.id,
        sourceType: 'template',
      },
    });
    await this.prisma.template.update({
      where: { id: templateId },
      data: { useCount: { increment: 1 } },
    });
    return mm;
  }

  async update(id: string, userId: string, dto: UpdateMindMapDto) {
    const existing = await this.prisma.mindMap.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'MINDMAP_NOT_FOUND' });
    if (existing.userId !== userId) throw new ForbiddenException({ code: 'MINDMAP_ACCESS_DENIED' });
    return this.prisma.mindMap.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.data !== undefined && { data: dto.data as never }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const existing = await this.prisma.mindMap.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'MINDMAP_NOT_FOUND' });
    if (existing.userId !== userId) throw new ForbiddenException({ code: 'MINDMAP_ACCESS_DENIED' });
    await this.prisma.mindMap.delete({ where: { id } });
  }
}
