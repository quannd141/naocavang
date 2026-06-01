import { Injectable } from '@nestjs/common';
import { AiRoutingService } from '../../ai/application/ai-routing.service';
import { type TutorContext, TUTOR_SYSTEM_PROMPT, buildTutorPrompt } from '../domain/tutor-prompt';

export interface TutorAnswer {
  answer: string;
  model: string;
}

/**
 * Application service for "Cá Vàng GPT". Stateless for the MVP — no conversation
 * persistence — so a request is: build prompt → route to AI → return the reply.
 */
@Injectable()
export class TutorService {
  constructor(private readonly ai: AiRoutingService) {}

  async ask(userId: string, question: string, context?: TutorContext): Promise<TutorAnswer> {
    const prompt = buildTutorPrompt(question, context);
    const result = await this.ai.chat({
      userId,
      prompt,
      systemPrompt: TUTOR_SYSTEM_PROMPT,
    });
    return { answer: result.content, model: result.model };
  }
}
