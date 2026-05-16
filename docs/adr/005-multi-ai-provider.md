# ADR-005: Multi-AI provider strategy với routing

**Status:** ACCEPTED
**Date:** 2026-05-16

---

## Context

Não Cá Vàng dùng AI cho 3 task chính:
1. **Sinh mind map** từ PDF/text (long context, structured output JSON)
2. **Sinh flashcard** từ mind map (medium context, Q&A pairs)
3. **Sinh quiz** từ mind map (medium context, structured MCQ)

Budget AI pre-revenue: **$50-100/tháng** cho cả ~100 user × 10-20 generation.

Câu hỏi:
- 1 provider hay multi?
- Model nào cho task nào, tier nào?
- Routing logic ở đâu?

## Decision

**Multi-AI strategy với centralized `AiRoutingService`:**

| User Tier | Default Model | Cost per generation (~est) |
|-----------|---------------|---------------------------|
| **Free** | Gemini Flash 2.0 | ~$0.003-0.01 |
| **Premium** (v0.2) | Claude Haiku 4.5 + prompt caching | ~$0.03-0.10 |
| **Pro** (v0.2) | Claude Sonnet 4.6 + prompt caching | ~$0.10-0.30 |

Plus:
- **Fallback chain:** Nếu primary fail → retry với secondary
- **Cost tracking:** Mọi call log vào `ai_usage_log`
- **Prompt caching** (Claude) cho system prompt + few-shot examples

## Rationale

### Tại sao multi-AI thay vì single?

1. **Cost optimization** — Gemini Flash rẻ hơn Claude Haiku ~10x, đủ tốt cho free
2. **Differentiation tier** — Premium/Pro xứng đáng quality cao hơn
3. **Avoid vendor lock-in** — không phụ thuộc 1 nhà cung cấp
4. **Fallback resilience** — nếu Anthropic down → fallback Google

### Tại sao Gemini Flash cho free tier?

- **Cost:** $0.075/1M input, $0.30/1M output — rẻ nhất
- **Quality:** đủ tốt cho mind map đơn giản (eval Sprint 3)
- **Latency:** ~3-5s cho mind map gen — chấp nhận được
- **Free tier API:** 60 req/min — đủ cho MVP

### Tại sao Claude (không phải GPT-4o-mini) cho Premium?

- **Quality:** Claude Sonnet 4.6 / Haiku 4.5 ra structured JSON tốt nhất (vs GPT-4o-mini)
- **Prompt caching:** Anthropic giảm 90% cost system prompt
- **Vietnamese:** Claude xử lý tiếng Việt tốt nhất theo benchmark
- **Vision:** Claude vision cho ảnh chụp sách (v0.2)

### Tại sao centralized routing?

- 1 nơi quản lý → dễ A/B test model
- 1 nơi log cost → easy monitor
- 1 nơi handle retry/fallback
- Application layer KHÔNG biết về model cụ thể

## Implementation

### `AiRoutingService` interface

```typescript
// apps/api/src/modules/ai/application/ai-routing.service.ts

export interface AiGenerationRequest {
  userId: string;
  task: 'mindmap_gen' | 'flashcard_gen' | 'quiz_gen';
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  jsonSchema?: object;
}

export interface AiGenerationResponse {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
}

@Injectable()
export class AiRoutingService {
  async generate(request: AiGenerationRequest): Promise<AiGenerationResponse> {
    const user = await this.userService.findById(request.userId);
    const model = this.selectModel(user.tier, request.task);
    const provider = this.getProvider(model);

    const startTime = Date.now();
    try {
      const result = await provider.generate({
        model,
        ...request,
      });
      const latencyMs = Date.now() - startTime;
      const costUsd = this.computeCost(model, result.inputTokens, result.outputTokens);

      // Log mọi call
      await this.usageLogRepo.create({
        userId: request.userId,
        operation: request.task,
        model,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        costUsd,
        latencyMs,
        status: 'success',
      });

      return { ...result, model, costUsd, latencyMs };
    } catch (err) {
      await this.usageLogRepo.create({ ..., status: 'failed' });

      // Fallback chain
      if (this.canFallback(model)) {
        return this.generate({ ...request, _fallbackFrom: model });
      }
      throw err;
    }
  }

  private selectModel(tier: UserTier, task: AiTask): string {
    if (tier === 'free') return 'gemini-flash-2.0';
    if (tier === 'premium') {
      return task === 'quiz_gen' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5';
    }
    if (tier === 'pro') return 'claude-sonnet-4-6';
    return 'gemini-flash-2.0';
  }
}
```

### Provider interface (Port — Hexagonal)

```typescript
// apps/api/src/modules/ai/domain/ports/ai-provider.port.ts

export interface AiProvider {
  generate(req: ProviderRequest): Promise<ProviderResponse>;
  supports(model: string): boolean;
}

// apps/api/src/infrastructure/ai-providers/gemini.adapter.ts
@Injectable()
export class GeminiAdapter implements AiProvider {
  supports(model: string) {
    return model.startsWith('gemini');
  }
  async generate(req: ProviderRequest) {
    // Google SDK call
  }
}

// apps/api/src/infrastructure/ai-providers/anthropic.adapter.ts
@Injectable()
export class AnthropicAdapter implements AiProvider {
  supports(model: string) {
    return model.startsWith('claude');
  }
  async generate(req: ProviderRequest) {
    // Anthropic SDK call với prompt caching
  }
}
```

### Cost computation

```typescript
const COST_TABLE: Record<string, { input: number; output: number }> = {
  // USD per 1M tokens
  'gemini-flash-2.0': { input: 0.075, output: 0.30 },
  'claude-haiku-4-5': { input: 0.80, output: 4.00 },   // est
  'claude-sonnet-4-6': { input: 3.00, output: 15.00 }, // est
};

function computeCost(model: string, inputTokens: number, outputTokens: number): number {
  const rate = COST_TABLE[model];
  return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000;
}
```

### Prompt caching (Claude)

```typescript
// Anthropic SDK call
const response = await anthropic.messages.create({
  model: 'claude-haiku-4-5',
  max_tokens: 4096,
  system: [
    {
      type: 'text',
      text: SYSTEM_PROMPT_MINDMAP, // Cached
      cache_control: { type: 'ephemeral' },
    },
  ],
  messages: [
    {
      role: 'user',
      content: userInput,
    },
  ],
});
```

**Tiết kiệm:** System prompt ~2000 token → giảm cost 90% sau lần đầu.

### Quota enforcement

```typescript
// Middleware kiểm tra trước khi call AI
async checkQuota(userId: string): Promise<void> {
  const user = await this.userService.findById(userId);
  if (user.aiQuotaUsed >= user.aiQuotaMonthly) {
    throw new QuotaExceededException(
      `Bạn đã dùng hết ${user.aiQuotaMonthly} lần AI tháng này. Nâng cấp Premium?`
    );
  }
}

// Sau call thành công
async decrementQuota(userId: string) {
  await this.userRepo.increment(userId, 'aiQuotaUsed', 1);
}
```

### Monthly quota reset

Cron job ngày 1 hàng tháng 00:00 Asia/Ho_Chi_Minh:

```typescript
@Cron('0 0 1 * *', { timeZone: 'Asia/Ho_Chi_Minh' })
async resetMonthlyQuotas() {
  await this.userRepo.updateMany({}, { aiQuotaUsed: 0 });
}
```

## Consequences

### Positive
- Cost optimal cho mỗi tier
- Easy A/B test models (chỉ đổi routing logic)
- Fallback resilience
- Centralized monitoring → catch cost spike sớm

### Negative
- Multi-provider phức tạp hơn single
- Test cần mock 2 providers
- Prompt phải tune cho cả Gemini + Claude (khác nhau nhẹ)

### Risks

- **Quality khác biệt:** Free user thấy Gemini Flash kém hơn Claude → churn
  - Mitigation: A/B test Sprint 3, nếu Gemini quality < threshold → consider Claude Haiku cho free (cost x10 nhưng giữ user)
- **Cost spike:** abuse hoặc user prank upload PDF khổng lồ
  - Mitigation: rate limit AI calls (5 mind map gen / 10 phút), validate PDF < 50MB / 100 trang trước call AI
- **Provider down:** Gemini / Anthropic outage
  - Mitigation: Fallback chain, queue retry

## Alternatives Considered

### Option B: Single provider (Claude Sonnet)

- **Pro:** Đơn giản, quality cao đồng đều
- **Con:** Cost $50-200/tháng cho 100 user free → vượt budget
- **Verdict:** ❌

### Option C: OpenRouter (1 API, nhiều model)

- **Pro:** 1 API key, dễ switch model
- **Con:** Markup ~5-10% giá, không có prompt caching
- **Verdict:** ❌ — direct provider rẻ hơn + caching mạnh

### Option D: Self-host Llama / Qwen

- **Pro:** Cost token = $0
- **Con:** GPU cost $50-200/tháng + ops overhead lớn, chưa bằng GPT-4 quality
- **Verdict:** ❌ Defer to scale 10k+ user

## Verify later

[V-305](../../VERIFY_LATER.md#v-305) — Đo cost thực tế sau Sprint 3, adjust routing nếu cần.
