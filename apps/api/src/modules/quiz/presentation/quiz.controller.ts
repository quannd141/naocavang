import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionAuthGuard, type AuthedUser } from '../../auth/infrastructure/session-auth.guard';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import { QuizService } from '../application/quiz.service';
import {
  CreateQuizDto,
  CreateQuizFromMindMapDto,
  SubmitAttemptDto,
} from './dto/quiz.dto';

@ApiTags('quizzes')
@Controller('quizzes')
@UseGuards(SessionAuthGuard)
@ApiBearerAuth()
export class QuizController {
  constructor(private readonly service: QuizService) {}

  @Get()
  @ApiOperation({ summary: 'List quizzes (across user mindmaps)' })
  async list(@CurrentUser() user: AuthedUser) {
    const items = await this.service.listMine(user.id);
    return { success: true, data: items };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get quiz detail (correctAnswer hidden unless ?reveal=true)',
  })
  async getOne(
    @Param('id') id: string,
    @Query('reveal') reveal: string | undefined,
    @CurrentUser() user: AuthedUser,
  ) {
    const includeAnswers = reveal === 'true' || reveal === '1';
    const quiz = await this.service.getQuiz(id, user.id, includeAnswers);
    return { success: true, data: quiz };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create quiz (manual with questions)' })
  async create(@Body() dto: CreateQuizDto, @CurrentUser() user: AuthedUser) {
    const quiz = await this.service.createQuiz(user.id, dto);
    return { success: true, data: quiz };
  }

  @Post('from-mindmap/:mindmapId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Auto-generate short-answer quiz from mind map (mechanical)' })
  async createFromMindmap(
    @Param('mindmapId') mindmapId: string,
    @Body() dto: CreateQuizFromMindMapDto,
    @CurrentUser() user: AuthedUser,
  ) {
    const quiz = await this.service.createFromMindmap(user.id, mindmapId, dto);
    return { success: true, data: quiz };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete quiz' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthedUser) {
    await this.service.deleteQuiz(id, user.id);
  }

  @Post(':id/attempts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Submit answers, get score + per-question results. Wrong answers append to deck if one exists for the same mindmap.',
  })
  async submit(
    @Param('id') quizId: string,
    @Body() dto: SubmitAttemptDto,
    @CurrentUser() user: AuthedUser,
  ) {
    const result = await this.service.submitAttempt(quizId, user.id, dto);
    return { success: true, data: result };
  }

  @Get(':id/attempts')
  @ApiOperation({ summary: "User's past attempts on this quiz" })
  async listAttempts(@Param('id') quizId: string, @CurrentUser() user: AuthedUser) {
    const items = await this.service.listAttempts(quizId, user.id);
    return { success: true, data: items };
  }
}
