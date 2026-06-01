import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthedUser } from '../../auth/infrastructure/session-auth.guard';
import { SessionAuthGuard } from '../../auth/infrastructure/session-auth.guard';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import { IngestService } from '../application/ingest.service';
import { MAX_PDF_BYTES } from '../domain/pdf-validation';
import { IngestPdfDto } from './dto/ingest.dto';

/** Structural type for the in-memory multer file (avoids an Express.Multer dep). */
interface UploadedPdf {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
}

@ApiTags('ingest')
@Controller('ingest')
@UseGuards(SessionAuthGuard)
@ApiBearerAuth()
export class IngestController {
  constructor(private readonly ingest: IngestService) {}

  @Post('pdf')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_PDF_BYTES } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Upload PDF → trích xuất text → tạo mind map + flashcard (mock khi NIGHT_SHIFT_MODE=true).',
  })
  async uploadPdf(
    @UploadedFile() file: UploadedPdf | undefined,
    @Body() dto: IngestPdfDto,
    @CurrentUser() user: AuthedUser,
  ) {
    if (!file) {
      throw new BadRequestException({ code: 'NO_FILE', message: 'Chưa chọn file PDF để tải lên' });
    }
    const result = await this.ingest.ingestPdf(
      user.id,
      {
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
        originalname: file.originalname,
      },
      { title: dto.title, subject: dto.subject },
    );
    return { success: true, data: result };
  }
}
