# ADR-002: Mind map storage — PostgreSQL JSONB

**Status:** ACCEPTED
**Date:** 2026-05-16

---

## Context

Mind map của Não Cá Vàng là cây hierarchical với:
- 1 root node
- Tối đa 4 cấp sâu
- Mỗi cấp 2-7 nhánh
- Trung bình 50-200 node/mind map, max ~1000 node

Cần lưu trữ + query hiệu quả với 2 tính chất xung đột:
1. **Linh hoạt schema:** node có text, color, icon, image, nested children — không cố định
2. **Liên kết relational:** mind map thuộc về user, có flashcard deck, quiz, template source

## Decision

Lưu mind map theo **JSONB column trong PostgreSQL** thay vì:
- Normalize thành table `nodes` riêng (mỗi node = 1 row)
- Tách qua MongoDB
- Dùng graph database (Neo4j)

### Schema chính:

```prisma
model MindMap {
  id              String   @id @default(uuid())
  userId          String
  title           String
  description     String?
  data            Json     // JSONB — full mind map tree
  subject         String?
  tags            String[]
  isPublic        Boolean  @default(false)
  sourceType      MindMapSource @default(MANUAL)
  sourceTemplateId String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id])
  flashcardDecks  FlashcardDeck[]
  quizzes         Quiz[]

  @@index([userId])
  @@index([isPublic])
}
```

### Cấu trúc `data` (JSON):

```json
{
  "version": 1,
  "rootId": "uuid-root",
  "nodes": {
    "uuid-root": {
      "id": "uuid-root",
      "text": "Hidrocacbon",
      "color": "blue",
      "icon": null,
      "imageUrl": null,
      "parentId": null,
      "position": 0
    },
    "uuid-1": {
      "id": "uuid-1",
      "text": "Ankan",
      "color": "green",
      "parentId": "uuid-root",
      "position": 0
    }
  },
  "edges": [
    { "id": "e1", "source": "uuid-root", "target": "uuid-1" }
  ],
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

## Rationale

**Pros:**
1. **Linh hoạt:** Schema node có thể evolve (thêm field) mà không cần migration
2. **Performance read:** 1 query lấy nguyên mind map, không N+1 join
3. **Performance write:** auto-save 1 update statement
4. **Atomic:** mỗi mind map = 1 row, update atomic
5. **JSONB index:** PostgreSQL hỗ trợ GIN index trên JSONB → search theo field nhanh
6. **Dev velocity:** Prisma + TypeScript → type-safe

**Cons:**
1. **Không query SQL từng node** (vd "tất cả node có text chứa 'foo'") — phải parse JSON trong app
2. **Mất relational integrity** giữa node-node (do là JSON nội bộ)
3. **Khó migrate schema** cho field cũ (cần script update JSONB)

## Consequences

### Positive
- Mind map editor đơn giản: load JSON 1 lần, edit in memory, save JSON
- Auto-save nhanh: PATCH JSONB
- Phù hợp với React Flow (nó cũng là JSON state)

### Negative
- **Khi cần real-time collab (v0.2+):** JSONB không đủ, cần CRDT (Yjs) layer
  - **Mitigation:** App layer dùng Yjs, persist Y.Doc snapshot vào JSONB. Không phải migrate DB.
- **Search nội dung mind map** (full-text search trên tất cả node text) khó
  - **Mitigation:** v0.2 thêm column `searchable_text` (tổng hợp text mọi node) + GIN tsvector index

### Performance benchmarks cần verify

- [ ] **POC Sprint 1:** render 500/1000/2000 node trong React Flow → đo FPS, memory
- [ ] **POC Sprint 1:** insert + update JSONB 1000-node mindmap → đo latency
- [ ] **VERIFY V-202** sau POC: confirm approach OK hay cần đổi

## Alternatives Considered

### Option B: Normalize `nodes` table riêng

```prisma
model Node {
  id        String  @id
  mindmapId String
  parentId  String?
  text      String
  color     String?
  position  Int
}
```

- **Pro:** Query SQL từng node, relational integrity
- **Con:** N+1 problem khi load mind map, write phức tạp (recursive update), auto-save chậm
- **Verdict:** ❌ Quá overhead cho use case

### Option C: MongoDB document

- **Pro:** Document-first native, schema flexible
- **Con:** Mất relational (user/billing), cần 2 DB (PG + Mongo), Prisma support kém hơn
- **Verdict:** ❌ Over-kill

### Option D: Neo4j graph DB

- **Pro:** Graph native, query cypher đẹp
- **Con:** Mind map là tree đơn giản (không phải graph thực sự), Neo4j Aura đắt, ecosystem nhỏ
- **Verdict:** ❌ Wrong tool

## Migration path nếu cần đổi

Nếu sau scale lên 10k+ mind map / user hoặc cần collab real-time:

1. Thêm CRDT layer (Yjs) trong app
2. Persist Y.Doc snapshot vào JSONB (cùng column)
3. Khi cần search → thêm Elasticsearch / Meilisearch index

→ KHÔNG cần migrate DB. Architecture vẫn vững.
