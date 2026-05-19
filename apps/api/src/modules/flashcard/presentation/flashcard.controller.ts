import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import { SessionAuthGuard, type AuthedUser } from '../../auth/infrastructure/session-auth.guard';
import { FlashcardService } from '../application/flashcard.service';
import {
  CreateDeckDto,
  CreateDeckFromMindMapDto,
  ReviewCardDto,
  UpdateDeckDto,
} from './dto/flashcard.dto';

@ApiTags('flashcards')
@Controller('flashcards')
@UseGuards(SessionAuthGuard)
@ApiBearerAuth()
export class FlashcardController {
  constructor(private readonly service: FlashcardService) {}

  // ---------- Decks ----------

  @Get('decks')
  @ApiOperation({ summary: 'List user decks (with total + due card counts)' })
  async listDecks(@CurrentUser() user: AuthedUser) {
    const items = await this.service.listDecks(user.id);
    return { success: true, data: items };
  }

  @Get('decks/:id')
  @ApiOperation({ summary: 'Get deck detail (with cards)' })
  async getDeck(@Param('id') id: string, @CurrentUser() user: AuthedUser) {
    const deck = await this.service.getDeck(id, user.id);
    return { success: true, data: deck };
  }

  @Post('decks')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create deck with cards (manual)' })
  async createDeck(@Body() dto: CreateDeckDto, @CurrentUser() user: AuthedUser) {
    const deck = await this.service.createDeck(user.id, dto);
    return { success: true, data: deck };
  }

  @Post('decks/from-mindmap/:mindmapId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Auto-generate deck from mind map nodes (mechanical)' })
  async createFromMindmap(
    @Param('mindmapId') mindmapId: string,
    @Body() dto: CreateDeckFromMindMapDto,
    @CurrentUser() user: AuthedUser,
  ) {
    const deck = await this.service.createFromMindmap(user.id, mindmapId, dto);
    return { success: true, data: deck };
  }

  @Patch('decks/:id')
  @ApiOperation({ summary: 'Update deck title' })
  async updateDeck(
    @Param('id') id: string,
    @Body() dto: UpdateDeckDto,
    @CurrentUser() user: AuthedUser,
  ) {
    const deck = await this.service.updateDeck(id, user.id, dto);
    return { success: true, data: deck };
  }

  @Delete('decks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete deck' })
  async deleteDeck(@Param('id') id: string, @CurrentUser() user: AuthedUser) {
    await this.service.deleteDeck(id, user.id);
  }

  // ---------- Study session ----------

  @Get('decks/:id/due')
  @ApiOperation({ summary: 'Get due cards for study session (cap 20)' })
  async getDueCards(
    @Param('id') id: string,
    @Query('limit') limitRaw: string | undefined,
    @CurrentUser() user: AuthedUser,
  ) {
    const limit = Math.min(Math.max(Number(limitRaw) || 20, 1), 100);
    const cards = await this.service.getDueCards(id, user.id, limit);
    return { success: true, data: cards };
  }

  @Post('cards/:cardId/review')
  @ApiOperation({ summary: 'Submit SM-2 review for a card (0..4 quality)' })
  async review(
    @Param('cardId') cardId: string,
    @Body() dto: ReviewCardDto,
    @CurrentUser() user: AuthedUser,
  ) {
    const result = await this.service.reviewCard(cardId, user.id, dto);
    return { success: true, data: result };
  }
}
