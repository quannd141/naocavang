import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class TutorChatDto {
  @ApiProperty({ description: 'Câu hỏi gửi cho Cá Vàng GPT' })
  @IsString()
  @MinLength(1, { message: 'Câu hỏi không được rỗng' })
  @MaxLength(2000, { message: 'Câu hỏi tối đa 2000 ký tự' })
  question!: string;

  @ApiPropertyOptional({ description: 'Tiêu đề mind map / chủ đề đang học (để AI bám ngữ cảnh)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  topicTitle?: string;

  @ApiPropertyOptional({ description: 'Mã môn học (math, biology, ...)' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  subject?: string;
}
