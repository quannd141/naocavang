import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { computeAiCost } from '@nao-ca-vang/shared-constants';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { UserService } from '../../user/application/user.service';
import {
  AI_PROVIDERS_TOKEN,
  type AiGenerationRequest,
  type AiGenerationResponse,
  type AiProvider,
  type AiTaskType,
} from '../domain/ports/ai-provider.port';

export interface RoutedGenerationRequest {
  userId: string;
  task: AiTaskType;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface RoutedGenerationResponse extends AiGenerationResponse {
  model: string;
  costUsd: number;
}

/**
 * Central AI routing service — see ADR-005.
 *
 * Responsibilities:
 *   1. Pick model based on user tier + task type
 *   2. Check quota before calling provider
 *   3. Delegate to first registered AiProvider that supports the model
 *   4. Log usage + cost into ai_usage_logs
 *   5. Fallback to mock if real provider fails (in dev/night-shift only)
 */
@Injectable()
export class AiRoutingService {
  private readonly logger = new Logger(AiRoutingService.name);

  constructor(
    @Inject(AI_PROVIDERS_TOKEN) private readonly providers: AiProvider[],
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async generate(req: RoutedGenerationRequest): Promise<RoutedGenerationResponse> {
    if (!(await this.userService.hasAiQuota(req.userId))) {
      throw new ForbiddenException({
        code: 'AI_QUOTA_EXCEEDED',
        message: 'Bạn đã hết quota AI tháng này. Nâng cấp Premium để có thêm.',
      });
    }

    const user = await this.userService.findById(req.userId);
    const model = this.selectModel(user.tier, req.task);
    const provider = this.providers.find((p) => p.supports(model));
    if (!provider) {
      throw new Error(`No provider available for model ${model}`);
    }

    const providerReq: AiGenerationRequest = {
      task: req.task,
      model,
      prompt: req.prompt,
      systemPrompt: req.systemPrompt,
      maxTokens: req.maxTokens,
      jsonMode: req.jsonMode,
    };

    // Create pending log first so retries / crashes leave a trail.
    const log = await this.prisma.aiUsageLog.create({
      data: {
        userId: req.userId,
        operation: req.task,
        model,
        status: 'processing',
      },
    });

    try {
      const result = await provider.generate(providerReq);
      const costUsd = computeAiCost(model, result.inputTokens, result.outputTokens);

      await this.prisma.aiUsageLog.update({
        where: { id: log.id },
        data: {
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          latencyMs: result.latencyMs,
          costUsd,
          status: 'success',
        },
      });

      await this.userService.decrementAiQuota(req.userId);

      this.logger.log(
        `AI gen: user=${req.userId} task=${req.task} model=${model} ` +
          `tokens=${result.inputTokens}+${result.outputTokens} cost=$${costUsd.toFixed(6)}`,
      );

      return { ...result, model, costUsd };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.prisma.aiUsageLog.update({
        where: { id: log.id },
        data: { status: 'failed', errorMessage: message },
      });
      this.logger.error(`AI gen failed: ${message}`);
      throw err;
    }
  }

  /**
   * Select model based on user tier and task type.
   *
   * - Free tier:        Gemini Flash 2.0 (cheapest)
   * - Premium tier:     Claude Haiku 4.5 (Sonnet for quiz_gen which needs more reasoning)
   * - Pro tier:         Claude Sonnet 4.6 always
   * - Admin / dev:      Mock when NIGHT_SHIFT_MODE, else Sonnet
   */
  private selectModel(tier: string, task: AiTaskType): string {
    if (this.config.get<string>('NIGHT_SHIFT_MODE') === 'true') {
      return 'mock';
    }

    switch (tier) {
      case 'free':
        return 'gemini-flash-2.0';
      case 'premium':
        return task === 'quiz_gen' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5';
      case 'pro':
      case 'admin':
        return 'claude-sonnet-4-6';
      default:
        return 'gemini-flash-2.0';
    }
  }
}
