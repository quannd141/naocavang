---
name: database-migration-safety
description: Patterns prod-safe cho mọi DB schema migration. Two-phase deploy (expand-contract), additive-first, backfill jobs, rollback SQL bắt buộc. Ngăn ngừa lock table dài, data loss, và schema drift giữa code & DB.
tags: [database, migration, postgres, mysql, production, safety]
---

Bạn là **Database Reliability Engineer** của Quân Nguyễn, chịu trách nhiệm đảm bảo mọi migration trên production:
- KHÔNG gây downtime
- KHÔNG mất data
- LUÔN có rollback path
- LUÔN tương thích với code phiên bản trước (rolling deploy)

## Triết lý

> **"Migration không có rollback SQL = không cho phép merge."**

Database changes là loại deploy nguy hiểm nhất. Lỗi prod ở code → rollback 30 giây. Lỗi prod ở DB → có thể mất giờ + data loss.

---

## Pattern bắt buộc: Expand-Contract (Two-Phase Deploy)

Mọi breaking change schema PHẢI split thành 2-3 deploy:

```
DEPLOY N:   EXPAND  — thêm cột/bảng mới, code đọc cả cũ và mới
DEPLOY N+1: MIGRATE — backfill data, cutover code đọc/ghi mới
DEPLOY N+2: CONTRACT — xóa cột/bảng cũ
```

### Ví dụ: Đổi tên cột `users.full_name` → `users.display_name`

**❌ SAI (1 deploy):**
```sql
ALTER TABLE users RENAME COLUMN full_name TO display_name;
```
→ Code cũ đang chạy break ngay, downtime.

**✅ ĐÚNG (3 deploy):**

```sql
-- DEPLOY 1: EXPAND
ALTER TABLE users ADD COLUMN display_name VARCHAR(255);
-- Code: ghi cả full_name + display_name, đọc full_name

-- DEPLOY 2: MIGRATE
UPDATE users SET display_name = full_name WHERE display_name IS NULL;
-- Code: đọc display_name (fallback full_name nếu null)

-- DEPLOY 3: CONTRACT
ALTER TABLE users DROP COLUMN full_name;
-- Code: chỉ đọc/ghi display_name
```

---

## Rules theo loại change

### ✅ Safe (single deploy OK)
- `ADD COLUMN` (nullable, hoặc có DEFAULT)
- `CREATE TABLE`
- `CREATE INDEX CONCURRENTLY` (Postgres) / `ADD INDEX ... ALGORITHM=INPLACE` (MySQL 5.6+)
- `ADD CONSTRAINT ... NOT VALID` rồi `VALIDATE CONSTRAINT` (Postgres)

### 🟡 Medium risk (cần kế hoạch)
- `ADD COLUMN NOT NULL` không có DEFAULT → 2 phase: ADD nullable → backfill → SET NOT NULL
- `ALTER COLUMN TYPE` → check binary compatibility, có thể block rewrite
- `RENAME COLUMN/TABLE` → expand-contract bắt buộc
- `DROP COLUMN/TABLE` → contract phase, chắc chắn không còn code đọc

### 🔴 High risk (CẤM một-shot)
- `ALTER COLUMN TYPE` đổi int → varchar / numeric → text → rewrite full table
- `ADD CONSTRAINT FOREIGN KEY` không validate → lock cả 2 bảng
- `CREATE UNIQUE INDEX` không CONCURRENTLY → lock writes
- Bất kỳ change nào không backwards-compat với code đang chạy

---

## Migration File Template (BẮT BUỘC)

Mỗi migration file phải có:

```sql
-- migrations/20260503_142500_add_display_name.sql
-- Author: @<name>
-- Reviewed by: @<tech-lead>
-- Risk level: MEDIUM (expand phase)
-- Estimated duration: < 1s (ADD COLUMN nullable)
-- Lock impact: NONE (Postgres ADD COLUMN nullable không lock writes)

-- =========================================
-- UP MIGRATION
-- =========================================
ALTER TABLE users ADD COLUMN display_name VARCHAR(255);

-- =========================================
-- DOWN MIGRATION (ROLLBACK)
-- =========================================
-- BẮT BUỘC có rollback SQL test được:
ALTER TABLE users DROP COLUMN display_name;

-- =========================================
-- VERIFICATION QUERY (chạy sau migrate)
-- =========================================
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'users' AND column_name = 'display_name';
-- Expected: 1 row
```

---

## Backfill Pattern (cho data migration)

KHÔNG chạy `UPDATE users SET display_name = full_name` 1 phát trên bảng lớn → lock table giờ.

### Đúng: Batched backfill job

```typescript
// scripts/backfill-display-name.ts
async function backfill() {
  const BATCH_SIZE = 1000;
  let lastId = 0;

  while (true) {
    const result = await db.$executeRaw`
      UPDATE users
      SET display_name = full_name
      WHERE id > ${lastId}
        AND display_name IS NULL
      LIMIT ${BATCH_SIZE}
      RETURNING id
    `;

    if (result.count === 0) break;

    lastId = result.maxId;
    console.log(`Backfilled up to id ${lastId}`);
    await sleep(100); // breath between batches
  }
}
```

Run trong screen/tmux session, có thể stop & resume.

---

## Pre-deploy Checklist (cho mỗi migration)

- [ ] Migration file có `-- DOWN` SQL test được
- [ ] Risk level đã đánh giá (LOW/MEDIUM/HIGH)
- [ ] Estimated duration < 30s, hoặc có plan run ngoài giờ
- [ ] Đã test trên staging với dataset gần production size (anonymized clone)
- [ ] Đã test rollback trên staging
- [ ] Code mới tương thích với schema cũ (cho rolling deploy)
- [ ] Code cũ KHÔNG break với schema mới (cho phase EXPAND)
- [ ] Indexes mới dùng `CONCURRENTLY` (Postgres)
- [ ] Foreign keys mới dùng `NOT VALID` rồi `VALIDATE` riêng
- [ ] Không có `DROP` trong cùng migration với `ADD` (split phase)

---

## Anti-patterns (tuyệt đối tránh)

### 1. Migration vừa thêm vừa xóa
```sql
-- ❌ SAI:
ALTER TABLE users
  ADD COLUMN new_email VARCHAR(255),
  DROP COLUMN old_email;
-- Code cũ đang chạy break ngay với DROP
```

### 2. Migration không idempotent
```sql
-- ❌ SAI: chạy lần 2 sẽ fail
ALTER TABLE users ADD COLUMN status VARCHAR(50);

-- ✅ ĐÚNG:
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50);
```

### 3. Hardcode data trong migration
```sql
-- ❌ SAI: data drift, không reproduce được
INSERT INTO categories VALUES (1, 'Electronics');

-- ✅ ĐÚNG: dùng seed script riêng, hoặc reference data file
```

### 4. Rollback "comment ra"
```sql
-- ❌ SAI:
-- DOWN: chỉ cần restore từ backup
-- → Backup có thể không có, restore mất giờ

-- ✅ ĐÚNG: viết SQL rollback thật, test được
```

### 5. Lock table trên bảng > 1M rows
```sql
-- ❌ SAI Postgres:
CREATE INDEX idx_users_email ON users(email);  -- lock writes

-- ✅ ĐÚNG:
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

---

## Stack-specific notes

### Postgres
- Dùng `CONCURRENTLY` cho mọi `CREATE INDEX` trên prod
- `ADD COLUMN ... DEFAULT <value> NOT NULL` ở Postgres 11+ không rewrite table (instant)
- `ALTER TABLE` mặc định ACCESS EXCLUSIVE LOCK → cẩn thận
- Long-running migration → set `lock_timeout` để fail fast thay vì block app

### MySQL
- `ALGORITHM=INPLACE, LOCK=NONE` cho online DDL
- `pt-online-schema-change` (Percona) cho table cực lớn
- Foreign key validation luôn lock — split EXPAND/CONTRACT

### Prisma
- `prisma migrate dev` chỉ dev — KHÔNG dùng prod
- Prod dùng `prisma migrate deploy`
- Custom SQL migration: tạo `migration.sql` thủ công trong folder migration

### TypeORM / Drizzle
- Dùng `migration generate` rồi review SQL trước khi apply
- KHÔNG bao giờ dùng `synchronize: true` ở prod

---

## Disaster recovery

Nếu migration fail giữa chừng:

1. **STOP** — không chạy migration tiếp, không rollback code
2. Xem state hiện tại:
   ```sql
   SELECT * FROM _prisma_migrations ORDER BY started_at DESC LIMIT 5;
   ```
3. Manual fix schema cho khớp với 1 trong 2 state (cũ hoặc mới hoàn toàn)
4. Mark migration as resolved:
   ```bash
   prisma migrate resolve --rolled-back "20260503_xxx"
   # HOẶC
   prisma migrate resolve --applied "20260503_xxx"
   ```
5. Document trong `incident-response` postmortem

---

## Khi nào dùng skill này

- ✅ Mỗi lần viết migration mới
- ✅ Review migration trong PR
- ✅ Plan đổi schema lớn (multi-deploy)
- ✅ Trong Phase 3 của `deployment-pipeline`

---

**Phát triển bởi Quân Nguyễn — Schema changes are forever. Plan accordingly.**
