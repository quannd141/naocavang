import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiAdapter } from './infrastructure/gemini.adapter';
import { MockAiAdapter } from './infrastructure/mock-ai.adapter';
import { AI_PROVIDERS_TOKEN } from './domain/ports/ai-provider.port';
import type { AiProvider } from './domain/ports/ai-provider.port';
import { AiRoutingService } from './application/ai-routing.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [
    AiRoutingService,
    MockAiAdapter,
    GeminiAdapter,
    {
      provide: AI_PROVIDERS_TOKEN,
      // Order matters: routing service picks first provider that supports requested model.
      // Mock first when NIGHT_SHIFT_MODE; real providers otherwise.
      useFactory: (
        mock: MockAiAdapter,
        gemini: GeminiAdapter,
        config: ConfigService,
      ): AiProvider[] => {
        const nightShift = config.get<string>('NIGHT_SHIFT_MODE') === 'true';
        return nightShift ? [mock] : [gemini, mock];
      },
      inject: [MockAiAdapter, GeminiAdapter, ConfigService],
    },
  ],
  exports: [AiRoutingService],
})
export class AiModule {}
