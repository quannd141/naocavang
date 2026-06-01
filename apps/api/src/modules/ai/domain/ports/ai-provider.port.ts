/**
 * AI Provider port (Hexagonal Architecture).
 *
 * Adapters implement this interface for each provider:
 *   - GeminiAdapter (Google Gemini)
 *   - AnthropicAdapter (Claude Haiku/Sonnet) — implement in Sprint 3
 *   - MockAiAdapter (deterministic fake for tests + night-shift)
 *
 * Reference: ADR-005.
 */

export const AI_PROVIDERS_TOKEN = Symbol('AI_PROVIDERS');

export type AiTaskType = 'mindmap_gen' | 'flashcard_gen' | 'quiz_gen' | 'tutor_chat';

export interface AiGenerationRequest {
  task: AiTaskType;
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  /** When true, instruct provider to return strict JSON */
  jsonMode?: boolean;
}

export interface AiGenerationResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  /** Provider-reported latency, in milliseconds. */
  latencyMs: number;
}

export interface AiProvider {
  /** Return true if this provider can handle the given model id. */
  supports(model: string): boolean;
  /** Execute the generation. Should throw on hard failures so router can fallback. */
  generate(req: AiGenerationRequest): Promise<AiGenerationResponse>;
}
