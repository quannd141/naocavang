import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCardInput {
  @ApiProperty({ example: 'Hàm số bậc 2 có dạng tổng quát là gì?' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  question!: string;

  @ApiProperty({ example: 'y = ax² + bx + c, với a ≠ 0' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  answer!: string;

  @ApiPropertyOptional({ enum: ['qa', 'cloze', 'mcq'] })
  @IsOptional()
  @IsString()
  format?: 'qa' | 'cloze' | 'mcq';
}

export class CreateDeckDto {
  @ApiProperty({ example: 'Toán 10 — Hàm số bậc 2' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'Mind map gắn với deck (BẮT BUỘC theo schema)' })
  @IsString()
  mindmapId!: string;

  @ApiProperty({ type: [CreateCardInput], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCardInput)
  cards!: CreateCardInput[];
}

export class UpdateDeckDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;
}

export class ReviewCardDto {
  @ApiProperty({
    description: 'Self-rating 0..4 (0=Lại, 2=Khó, 3=Tốt, 4=Dễ)',
    minimum: 0,
    maximum: 4,
  })
  @IsInt()
  @Min(0)
  quality!: 0 | 1 | 2 | 3 | 4;
}

export class CreateDeckFromMindMapDto {
  @ApiPropertyOptional({ example: 'Deck từ mind map A' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}
