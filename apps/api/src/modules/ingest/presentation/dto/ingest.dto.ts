import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Optional multipart form fields accompanying the PDF upload. The file itself
 * is handled by FileInterceptor, not by this DTO.
 */
export class IngestPdfDto {
  @ApiPropertyOptional({ description: 'Tiêu đề tuỳ chọn (mặc định lấy từ tên file)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Mã môn học gợi ý (math, biology, ...)' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  subject?: string;
}
