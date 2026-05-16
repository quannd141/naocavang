# ADR-004: Spaced Repetition algorithm — SM-2

**Status:** ACCEPTED (with planned re-evaluation)
**Date:** 2026-05-16

---

## Context

Não Cá Vàng MVP cần spaced repetition (SR) cho flashcard. Câu hỏi: dùng thuật toán nào?

Các option chính:
1. **SM-2** (SuperMemo 2) — 1987, classic, Anki dùng
2. **FSRS** (Free Spaced Repetition Scheduler) — 2022, modern, ML-based
3. **Custom interval** (Quizlet style) — đơn giản nhất, ít chính xác

## Decision

**MVP v0.1 dùng SM-2.** Re-evaluate FSRS sau v0.2 khi có data user thật.

## Rationale

### Tại sao SM-2 cho MVP:

1. **Battle-tested 35+ năm:** Anki, SuperMemo dùng → user quen
2. **Implementation đơn giản** (~50 dòng code) → ship nhanh
3. **Không cần ML model** → không tốn cost AI
4. **Public domain** → không license issue
5. **Đủ tốt** cho 95% use case

### Tại sao chưa dùng FSRS:

1. **FSRS cần training data** — pre-trained model là tiếng Anh, có thể không fit người Việt
2. **Implementation phức tạp hơn** — ML inference
3. **Chưa được proven ở scale** mass-market product
4. **MVP cần ship nhanh** — SM-2 đủ tốt làm baseline

## Implementation

### Database schema (Flashcard table)

```prisma
model Flashcard {
  id              String   @id @default(uuid())
  deckId          String
  question        String   @db.Text
  answer          String   @db.Text
  format          FlashcardFormat @default(QA)

  // SM-2 fields
  easeFactor      Decimal  @default(2.5) @db.Decimal(4, 2)  // min 1.3
  interval        Int      @default(0)   // days until next review
  repetitions     Int      @default(0)   // consecutive correct count
  nextReviewAt    DateTime @default(now())
  lastReviewedAt  DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  reviewLogs      ReviewLog[]

  @@index([deckId])
  @@index([nextReviewAt])
}

model ReviewLog {
  id          String   @id @default(uuid())
  flashcardId String
  userId      String
  quality     Int      // 0-4 user self-rating
  intervalBefore Int
  intervalAfter  Int
  easeFactorBefore Decimal @db.Decimal(4, 2)
  easeFactorAfter  Decimal @db.Decimal(4, 2)
  reviewedAt  DateTime @default(now())

  @@index([flashcardId, reviewedAt])
}
```

### Algorithm (TypeScript)

```typescript
// apps/api/src/modules/flashcard/domain/sm2.ts

export interface Sm2State {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface Sm2Input extends Sm2State {
  quality: 0 | 1 | 2 | 3 | 4; // user self-rate: Lại / Khó / Tốt / Dễ (we map: 0=Lại, 2=Khó, 3=Tốt, 4=Dễ)
}

/**
 * SM-2 algorithm — computes next interval after review.
 *
 * Reference: https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
 */
export function sm2(input: Sm2Input): Sm2State {
  const { quality } = input;
  let { easeFactor, interval, repetitions } = input;

  if (quality < 3) {
    // Lại / Khó — reset
    repetitions = 0;
    interval = 1;
  } else {
    // Tốt / Dễ — advance
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return { easeFactor, interval, repetitions };
}
```

### Review service flow

```typescript
async reviewFlashcard(cardId: string, quality: 0|1|2|3|4) {
  const card = await this.cardRepo.findById(cardId);

  const before = {
    easeFactor: card.easeFactor.toNumber(),
    interval: card.interval,
    repetitions: card.repetitions,
  };

  const after = sm2({ ...before, quality });

  const nextReviewAt = new Date(Date.now() + after.interval * 86400_000);

  await this.cardRepo.update(cardId, {
    ...after,
    nextReviewAt,
    lastReviewedAt: new Date(),
  });

  await this.reviewLogRepo.create({
    flashcardId: cardId,
    quality,
    intervalBefore: before.interval,
    intervalAfter: after.interval,
    easeFactorBefore: before.easeFactor,
    easeFactorAfter: after.easeFactor,
  });

  return after;
}
```

### Query "due today"

```sql
SELECT * FROM flashcards
WHERE deck_id IN (SELECT id FROM flashcard_decks WHERE user_id = $1)
  AND next_review_at <= NOW()
ORDER BY next_review_at ASC
LIMIT 100;
```

Index `(deck_id, next_review_at)` → fast query.

## Quality rating UX

User self-rate trên 4 button (mapping với SM-2 quality):

| UX Label | Quality value | Meaning | Effect |
|----------|---------------|---------|--------|
| 🔄 Lại | 0 | Hoàn toàn quên | Reset interval = 1 ngày |
| 😕 Khó | 2 | Nhớ nhưng khó | Reset interval = 1 ngày, EF giảm |
| ✓ Tốt | 3 | Nhớ ok | Tăng interval × EF |
| ⚡ Dễ | 4 | Quá dễ | Tăng interval × EF × 1.3, EF tăng |

> KHÔNG cho quality = 1 — UX không cần granularity đó.

## Consequences

### Positive
- Implementation ngắn, dễ test
- Schedule predictable
- User quen từ Anki

### Negative
- Không cá nhân hóa theo user pattern
- Long-term retention có thể không tối ưu bằng FSRS
- Quality 4 mức có thể không đủ nuance

### Re-evaluation triggers

Cân nhắc migrate FSRS khi:
- [ ] Có ≥ 1000 user active với ≥ 100 reviews/user
- [ ] User complain "lịch ôn quá dày" hoặc "quá thưa"
- [ ] FSRS pretrained model có Vietnamese dataset

Lúc đó:
1. A/B test FSRS vs SM-2 với 10% user
2. Đo retention sau 30 ngày
3. Nếu FSRS tốt hơn ≥ 10% → migrate (giữ SM-2 state, override schedule)

## Alternatives Considered

### Option B: FSRS (modern)

- **Pro:** Tốt hơn 20-40% retention theo paper
- **Con:** Phức tạp, cần model training, chưa proven Vietnamese
- **Verdict:** ❌ Defer to v0.3+

### Option C: Quizlet "Learn mode" (custom interval)

- **Pro:** Đơn giản
- **Con:** Không khoa học, retention kém hơn SM-2
- **Verdict:** ❌

### Option D: Leitner box (1-5-15-30 days)

- **Pro:** Cực đơn giản
- **Con:** Không adaptive, kém SM-2
- **Verdict:** ❌

## References

- [SuperMemo 2 — Wikipedia](https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm)
- [SM-2 vs FSRS comparison](https://github.com/open-spaced-repetition/fsrs4anki)

## Verify later

[V-203](../../VERIFY_LATER.md#v-203) — Re-evaluate FSRS sau v0.2.
