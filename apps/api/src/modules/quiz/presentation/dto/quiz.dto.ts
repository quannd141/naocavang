import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export type QuizQuestionType = 'multiple_choice' | 'cloze' | 'short_answer';

export class CreateQuestionInput {
  @ApiProperty({ enum: ['multiple_choice', 'cloze', 'short_answer'] })
  @IsEnum(['multiple_choice', 'cloze', 'short_answer'])
  type!: QuizQuestionType;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  question!: string;

  @ApiPropertyOptional({ type: [String], description: 'Required for multiple_choice' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  correctAnswer!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  explanation?: string;
}

export class CreateQuizDto {
  @ApiProperty({ example: 'Quiz Toán 10 — Hàm số bậc 2' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  mindmapId!: string;

  @ApiPropertyOptional({ enum: ['easy', 'medium', 'hard'] })
  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: 'easy' | 'medium' | 'hard';

  @ApiProperty({ type: [CreateQuestionInput], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionInput)
  questions!: CreateQuestionInput[];
}

export class CreateQuizFromMindMapDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ enum: ['easy', 'medium', 'hard'] })
  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: 'easy' | 'medium' | 'hard';
}

export class SubmitAnswerInput {
  @ApiProperty()
  @IsString()
  questionId!: string;

  @ApiProperty({ description: 'User answer — text (for any question type)' })
  @IsString()
  @MaxLength(2000)
  answer!: string;
}

export class SubmitAttemptDto {
  @ApiProperty({ type: [SubmitAnswerInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerInput)
  answers!: SubmitAnswerInput[];

  @ApiPropertyOptional({ description: 'Total time spent in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentSec?: number;
}
