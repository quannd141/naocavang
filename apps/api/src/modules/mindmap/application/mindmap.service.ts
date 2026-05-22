import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ZodError } from 'zod';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { mindMapDataSchema } from '../domain/mindmap-data.schema';
import type { CreateMindMapDto, UpdateMindMapDto } from '../presentation/dto/mindmap.dto';

@Injectable()
export class MindMapService {
  constructor(private readonly prisma: PrismaService) {}

  private validateData(data: unknown): void {
    try {
      mindMapDataSchema.parse(data);
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`);
        throw new BadRequestException({
          code: 'INVALID_MINDMAP_DATA',
          message: 'Cấu trúc mind map không hợp lệ',
          issues,
        });
      }
      throw err;
    }
  }

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

  /**
   * Public read-only view — no auth required, only succeeds when isPublic=true.
   * Author email/name are surfaced so the viewer can give credit.
   */
  async getPublic(id: string) {
    const mm = await this.prisma.mindMap.findUnique({
      where: { id },
      include: { user: { select: { name: true } } },
    });
    if (!mm || !mm.isPublic) {
      // 404 (not 403) so we don't leak existence of private mindmaps.
      throw new NotFoundException({ code: 'PUBLIC_MINDMAP_NOT_FOUND' });
    }
    return {
      id: mm.id,
      title: mm.title,
      description: mm.description,
      subject: mm.subject,
      tags: mm.tags,
      data: mm.data,
      authorName: mm.user.name,
      sourceType: mm.sourceType,
      createdAt: mm.createdAt,
      updatedAt: mm.updatedAt,
    };
  }

  async create(userId: string, dto: CreateMindMapDto) {
    this.validateData(dto.data);
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
    if (dto.data !== undefined) this.validateData(dto.data);
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

  /**
   * Duplicate an existing mind map into the caller's account. Works for both
   * owned mind maps and any public mind map (fork-on-write). The clone keeps
   * the same data + subject + tags but resets isPublic to false.
   */
  async clone(id: string, userId: string) {
    const source = await this.prisma.mindMap.findUnique({ where: { id } });
    if (!source) throw new NotFoundException({ code: 'MINDMAP_NOT_FOUND' });
    if (!source.isPublic && source.userId !== userId) {
      throw new ForbiddenException({ code: 'MINDMAP_ACCESS_DENIED' });
    }
    return this.prisma.mindMap.create({
      data: {
        userId,
        title: `${source.title} (sao chép)`,
        description: source.description,
        data: source.data as never,
        subject: source.subject,
        tags: source.tags,
        sourceTemplateId: null,
        // Cloned mindmaps surface as 'manual' (the enum doesn't include 'clone')
        // so they appear in the user's library like any hand-edited map.
        sourceType: 'manual',
        isPublic: false,
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
