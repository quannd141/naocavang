# ADR-003: Monorepo với Turborepo + pnpm

**Status:** ACCEPTED
**Date:** 2026-05-16

---

## Context

Não Cá Vàng có:
- 1 frontend Next.js (`apps/web`)
- 1 backend NestJS (`apps/api`)
- 1 background worker NestJS (`apps/worker` — có thể merge với api cho MVP)
- Shared TypeScript types FE↔BE
- Shared constants (subjects, grades, ...)
- Shared eslint config / tsconfig

Câu hỏi: 1 repo hay nhiều?

## Decision

**Monorepo duy nhất** sử dụng **Turborepo + pnpm workspace**.

### Cấu trúc:

```
nao-ca-vang/
├── apps/
│   ├── web/              # Next.js 14
│   └── api/              # NestJS (BE API + worker chung process, tách sau nếu cần)
├── packages/
│   ├── shared-types/     # TypeScript interfaces dùng chung FE+BE
│   ├── shared-constants/ # Subjects, grades, AI quotas
│   ├── eslint-config/    # Shared lint config
│   └── tsconfig/         # Shared tsconfig base
├── docs/
├── scripts/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Tooling:

- **Package manager:** `pnpm 9` — disk efficient, fast
- **Task runner:** `turbo` — cache build, parallel run scripts
- **Workspace protocol:** `workspace:*` cho internal package

## Rationale

**Tại sao monorepo:**
1. **Shared types thực sự shared** — không sync npm publish
2. **1 PR** cho cross-cutting change (vd: thêm field User cần update FE + BE + types)
3. **Solo dev productivity** — 1 lệnh `pnpm dev` chạy cả FE + BE
4. **Refactor an toàn** — IDE rename across packages

**Tại sao Turborepo thay vì Nx/Lerna/Rush:**
- Setup đơn giản nhất (`turbo.json` 1 file)
- Cache build local + remote (Vercel Remote Cache miễn phí)
- Parallel task execution
- Vercel native support

**Tại sao pnpm thay vì npm/yarn:**
- Disk: pnpm dùng symlink → tiết kiệm 70% disk
- Speed: faster install than npm/yarn
- Strict: catch hoisting bugs
- Workspace support built-in

## Implementation details

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Internal package usage example:

```typescript
// apps/web/src/lib/api-client.ts
import type { CreateMindmapDto } from '@nao-ca-vang/shared-types';

// apps/api/src/modules/mindmap/dto/create-mindmap.dto.ts
import type { CreateMindmapDto } from '@nao-ca-vang/shared-types';
```

## Consequences

### Positive
- Type safety FE↔BE qua shared types
- 1 git history, dễ trace
- 1 CI pipeline cho cả FE + BE
- Turborepo cache → CI build nhanh

### Negative
- Repo lớn hơn polyrepo → clone lâu hơn (mitigate: shallow clone trong CI)
- Cần thiết lập tooling đúng từ đầu — sai dễ rối
- Vercel deploy `apps/web` cần config root + build command rõ ràng

### Risks

- **CI cache invalidation:** nếu turbo.json sai → cache miss nhiều → CI chậm
  - Mitigation: docs `docs/dev/monorepo-guide.md`
- **Cyclic dependency:** package A import B, B import A
  - Mitigation: ESLint rule `import/no-cycle`

## Alternatives Considered

### Option B: Polyrepo (2 repos riêng)

- **Pro:** Đơn giản, mỗi repo focus
- **Con:** Sync types khó (publish npm hoặc git submodule), cross-cutting PR khó
- **Verdict:** ❌ Solo dev sẽ khổ với sync

### Option C: Nx monorepo

- **Pro:** Tooling phong phú, plugin nhiều
- **Con:** Setup phức tạp hơn Turbo, learning curve
- **Verdict:** ❌ Over-kill cho 2 app

### Option D: Single-package fullstack (Next.js API routes only)

- **Pro:** Đơn giản nhất, 1 deploy
- **Con:** NestJS power features (DI, modular) mất, background worker khó
- **Verdict:** ❌ Mất Clean Architecture
