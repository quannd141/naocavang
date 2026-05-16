---
skill: tech-lead
name: 01-tech-stack-decision
description: Đưa ra tech stack decision có justification + ADR
---

## Input prompt

> "Dự án mới: hệ thống quản lý đơn hàng (OMS) cho shop bán lẻ.
> - Dự kiến 2000 đơn/ngày, 50 user đồng thời
> - Team: 2 backend + 1 frontend + 1 QA, mạnh TypeScript
> - VPS 8GB RAM, budget thấp
> - Timeline 4 tháng MVP
>
> Đề xuất tech stack + viết ADR."

## Expected behaviors (PHẢI có)

- [ ] Đề xuất stack **1 lựa chọn cụ thể** (không "X hoặc Y")
- [ ] Frontend: framework cụ thể (vd: Next.js 14, không "React/Vue tuỳ chọn")
- [ ] Backend: framework cụ thể (vd: NestJS)
- [ ] Database: cụ thể + lý do (vd: PostgreSQL vì ACID, không phải MongoDB)
- [ ] ORM: cụ thể (vd: Prisma)
- [ ] Deployment: cụ thể phù hợp budget (vd: Docker Compose trên VPS, không K8s)
- [ ] **Justification** từng lựa chọn theo constraint dự án (team skill, scale, budget, timeline)
- [ ] Viết ADR theo format chuẩn: `# ADR-001` → `## Status` → `## Context` → `## Decision` → `## Consequences`
- [ ] Liệt kê **alternatives considered** trong ADR (ít nhất 2 alternative + lý do bị loại)
- [ ] Liệt kê **trade-off / risk** của quyết định (vd: lock-in Prisma, vendor risk)

## Forbidden behaviors (KHÔNG được)

- [ ] Stack dạng "Next.js hoặc Remix, tuỳ team chọn" (đẩy decision lại user)
- [ ] Đề xuất Kubernetes / microservices cho dự án nhỏ này (over-engineering)
- [ ] Bỏ qua constraint cụ thể (vd: đề xuất MongoDB Atlas dù budget thấp)
- [ ] ADR thiếu section Alternatives hoặc Consequences
- [ ] Hype-driven choice (vd: "dùng Bun vì mới và nhanh") thiếu justification

## Pass criteria

- **Pass**: ≥ 8/10 expected + 0 forbidden
- **Fail**: < 8 expected hoặc ≥ 1 forbidden

## Notes

Eval này test **decisiveness** của tech lead. Skill thường mắc lỗi:
1. Đề xuất "X hoặc Y" → đẩy decision lại user (tech lead phải decide)
2. Over-engineering (K8s cho 50 user concurrent)
3. ADR sơ sài (thiếu Alternatives → không biết tại sao chọn X mà không phải Y)
