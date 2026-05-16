/**
 * AI model pricing (USD per 1 million tokens).
 * Verify with provider docs quarterly (prices change).
 *
 * Used by AiRoutingService to compute and log cost per generation.
 */

export interface ModelCost {
  inputPer1M: number;
  outputPer1M: number;
}

export const AI_MODEL_COSTS: Record<string, ModelCost> = {
  'gemini-flash-2.0': { inputPer1M: 0.075, outputPer1M: 0.3 },
  'claude-haiku-4-5': { inputPer1M: 0.8, outputPer1M: 4.0 },
  'claude-sonnet-4-6': { inputPer1M: 3.0, outputPer1M: 15.0 },
  mock: { inputPer1M: 0, outputPer1M: 0 },
};

export function computeAiCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const rate = AI_MODEL_COSTS[model];
  if (!rate) return 0;
  return (inputTokens * rate.inputPer1M + outputTokens * rate.outputPer1M) / 1_000_000;
}
