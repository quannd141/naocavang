/**
 * AI provider types — see ADR-005 for multi-provider strategy.
 */

export type AiTask = 'mindmap_gen' | 'flashcard_gen' | 'quiz_gen';

export type AiModelId =
  | 'gemini-flash-2.0'
  | 'claude-haiku-4-5'
  | 'claude-sonnet-4-6'
  | 'mock';

export type AiOperationStatus = 'pending' | 'processing' | 'success' | 'failed';

export interface AiUsageLogEntry {
  id: string;
  userId: string;
  operation: AiTask;
  model: AiModelId;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  status: AiOperationStatus;
  createdAt: string;
}

export interface AiGenerationJobResult {
  jobId: string;
  status: AiOperationStatus;
  resourceId?: string; // mindmap id, deck id, etc.
  error?: string;
}
