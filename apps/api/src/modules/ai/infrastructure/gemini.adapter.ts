import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AiGenerationRequest,
  AiGenerationResponse,
  AiProvider,
} from '../domain/ports/ai-provider.port';

/**
 * Google Gemini Flash 2.0 adapter — free tier of Não Cá Vàng.
 *
 * SCAFFOLD ONLY in night-shift: real SDK call is gated behind a runtime check
 * because GEMINI_API_KEY is FAKE_KEY_DO_NOT_USE during night-shift.
 *
 * Real implementation in Sprint 3 once Quân provisions Gemini key
 * (see PENDING_HUMAN.md).
 */
@Injectable()
export class GeminiAdapter implements AiProvider {
  private readonly logger = new Logger(GeminiAdapter.name);

  constructor(private readonly config: ConfigService) {}

  supports(model: string): boolean {
    return model.startsWith('gemini');
  }

  async generate(_req: AiGenerationRequest): Promise<AiGenerationResponse> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey || apiKey === 'FAKE_KEY_DO_NOT_USE') {
      throw new Error(
        'GeminiAdapter cannot run in night-shift: GEMINI_API_KEY is FAKE. ' +
          'Use MockAiAdapter or provision a real key.',
      );
    }

    // TODO(Sprint 3): real implementation
    //   const genAI = new GoogleGenerativeAI(apiKey);
    //   const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    //   const result = await model.generateContent({ contents: [...] });
    //   return { content: result.response.text(), inputTokens, outputTokens, latencyMs };

    this.logger.error('GeminiAdapter.generate() not implemented yet — use MockAiAdapter in night-shift.');
    throw new Error('GeminiAdapter not implemented — scheduled for Sprint 3.');
  }
}
