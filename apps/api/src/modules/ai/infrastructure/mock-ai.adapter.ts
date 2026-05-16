import { Injectable, Logger } from '@nestjs/common';
import type {
  AiGenerationRequest,
  AiGenerationResponse,
  AiProvider,
} from '../domain/ports/ai-provider.port';

/**
 * Deterministic mock AI provider for tests + night-shift mode.
 *
 * Per night-shift skill Constraint 1: no real API calls until human provisions keys.
 * Returns plausible structured output for each task type, with stable shape so
 * downstream code can be developed and unit-tested without network.
 */
@Injectable()
export class MockAiAdapter implements AiProvider {
  private readonly logger = new Logger(MockAiAdapter.name);

  supports(model: string): boolean {
    return model === 'mock' || model === 'gemini-flash-2.0' || model.startsWith('claude-');
  }

  async generate(req: AiGenerationRequest): Promise<AiGenerationResponse> {
    this.logger.debug(`[MOCK] task=${req.task} model=${req.model} prompt.length=${req.prompt.length}`);

    const start = Date.now();
    // Simulate realistic latency so timing-related code paths get exercised.
    await sleep(50 + Math.random() * 150);

    const content = this.buildResponse(req);
    return {
      content,
      inputTokens: estimateTokens(req.prompt),
      outputTokens: estimateTokens(content),
      latencyMs: Date.now() - start,
    };
  }

  private buildResponse(req: AiGenerationRequest): string {
    switch (req.task) {
      case 'mindmap_gen':
        return JSON.stringify(MOCK_MINDMAP);
      case 'flashcard_gen':
        return JSON.stringify(MOCK_FLASHCARDS);
      case 'quiz_gen':
        return JSON.stringify(MOCK_QUIZ);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Rough token estimate: ~4 chars per token. Good enough for cost logging in mock mode. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

const MOCK_MINDMAP = {
  version: 1,
  rootId: 'root',
  title: '[MOCK] Mind map giả lập',
  nodes: {
    root: {
      id: 'root',
      text: 'Chủ đề chính (mock)',
      color: 'blue',
      icon: null,
      imageUrl: null,
      parentId: null,
      position: 0,
    },
    n1: {
      id: 'n1',
      text: 'Nhánh 1',
      color: 'green',
      icon: null,
      imageUrl: null,
      parentId: 'root',
      position: 0,
    },
    n2: {
      id: 'n2',
      text: 'Nhánh 2',
      color: 'green',
      icon: null,
      imageUrl: null,
      parentId: 'root',
      position: 1,
    },
    n3: {
      id: 'n3',
      text: 'Nhánh 3',
      color: 'green',
      icon: null,
      imageUrl: null,
      parentId: 'root',
      position: 2,
    },
  },
  edges: [
    { id: 'e1', source: 'root', target: 'n1' },
    { id: 'e2', source: 'root', target: 'n2' },
    { id: 'e3', source: 'root', target: 'n3' },
  ],
  viewport: { x: 0, y: 0, zoom: 1 },
};

const MOCK_FLASHCARDS = {
  cards: [
    {
      question: '[MOCK] Định nghĩa khái niệm A là gì?',
      answer: 'Khái niệm A là một khái niệm giả lập dùng cho test.',
      format: 'qa',
    },
    {
      question: '[MOCK] So sánh A và B?',
      answer: 'A và B khác nhau ở điểm X (giả lập).',
      format: 'qa',
    },
  ],
};

const MOCK_QUIZ = {
  questions: [
    {
      type: 'multiple_choice',
      question: '[MOCK] Câu hỏi trắc nghiệm số 1?',
      options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
      correctAnswer: 'Đáp án A',
      explanation: 'Vì lý do giả lập 1.',
    },
  ],
};
