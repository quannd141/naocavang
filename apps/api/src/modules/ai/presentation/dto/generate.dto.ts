import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class GenerateMindMapDto {
  @ApiProperty({ description: 'Text input (notes / paste) to convert into a mind map' })
  @IsString()
  @MinLength(10, { message: 'Nội dung tối thiểu 10 ký tự' })
  @MaxLength(20000)
  prompt!: string;

  @ApiPropertyOptional({ enum: ['math', 'physics', 'chemistry', 'biology', 'history', 'geography', 'literature', 'english', 'general'] })
  @IsOptional()
  @IsString()
  @IsIn(['math', 'physics', 'chemistry', 'biology', 'history', 'geography', 'literature', 'english', 'general'])
  subject?: string;
}
