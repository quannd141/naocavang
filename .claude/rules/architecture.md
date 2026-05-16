# Architecture Principles - Quân Nguyễn

## Kiến trúc Tổng thể

Chúng tôi áp dụng **Clean Architecture / Layered Architecture** kết hợp **Domain-Driven Design (DDD)** cho các dự án vừa và lớn.

Nguyên tắc cốt lõi:
- Core business logic **không phụ thuộc** vào framework, database hay external service.
- Mọi layer giao tiếp qua **interface/abstraction**, không phụ thuộc concrete implementation.
- Dependency chỉ đi từ ngoài vào trong (Dependency Rule).

## Các Layer và Trách nhiệm

```
┌─────────────────────────────────────┐
│         Presentation Layer          │  Controllers, Routes, DTOs, Serializers
│    (HTTP / GraphQL / WebSocket)      │
├─────────────────────────────────────┤
│         Application Layer           │  Use Cases, Application Services,
│       (Orchestration)               │  Command/Query Handlers (CQRS)
├─────────────────────────────────────┤
│           Domain Layer              │  Entities, Value Objects, Domain Services,
│     (Core Business Logic)           │  Aggregates, Domain Events, Interfaces
├─────────────────────────────────────┤
│       Infrastructure Layer          │  DB Repositories, External APIs,
│    (Technical Implementation)       │  Message Queue, Cache, Email, Storage
└─────────────────────────────────────┘
```

### Presentation Layer
- Nhận HTTP request, validate input (DTO), gọi Application Layer.
- Không chứa business logic.
- Trả về response chuẩn (HTTP status code, error format thống nhất).

### Application Layer
- Điều phối use case: gọi domain services, repositories, external services.
- Không chứa business rules — chỉ orchestrate.
- Xử lý transaction boundary.

### Domain Layer
- **Entities**: Có identity, chứa business logic và state.
- **Value Objects**: Immutable, so sánh theo giá trị.
- **Domain Services**: Business logic không thuộc về entity cụ thể nào.
- **Repository Interfaces**: Định nghĩa contract, không implement.
- **Domain Events**: Sự kiện xảy ra trong domain.

### Infrastructure Layer
- Implement Repository Interfaces (DB, cache...).
- Kết nối external services (API, email, storage).
- Không chứa business logic.

## Naming Convention theo Layer

| Layer | Suffix ví dụ | Ví dụ |
|-------|-------------|-------|
| Controller | `Controller` | `UserController` |
| Use Case / Service | `Service`, `UseCase` | `CreateUserService` |
| Entity | (không suffix) | `User`, `Order` |
| Value Object | (mô tả giá trị) | `Email`, `Money` |
| Repository Interface | `Repository` | `UserRepository` |
| Repository Implement | `PrismaUserRepository` | `PrismaUserRepository` |
| DTO | `Dto`, `Request`, `Response` | `CreateUserDto` |
| Event | `Event` | `UserCreatedEvent` |

## Folder Structure (NestJS ví dụ)

```
src/
├── modules/
│   ├── users/
│   │   ├── domain/
│   │   │   ├── user.entity.ts
│   │   │   ├── user.repository.ts        # Interface
│   │   │   └── user-created.event.ts
│   │   ├── application/
│   │   │   ├── create-user.service.ts
│   │   │   └── get-user.service.ts
│   │   ├── infrastructure/
│   │   │   └── prisma-user.repository.ts # Implementation
│   │   └── presentation/
│   │       ├── user.controller.ts
│   │       └── dto/
│   └── orders/
│       └── ...
├── shared/
│   ├── errors/           # Custom error classes
│   ├── logger/           # Logging setup
│   ├── utils/            # Pure utility functions
│   └── decorators/       # Custom decorators
└── infrastructure/
    ├── database/         # DB connection, migrations
    ├── cache/            # Redis setup
    └── messaging/        # Queue setup
```

## API Response Format Chuẩn

Mọi API phải trả về format thống nhất:

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 100 }   // nếu có pagination
}

// Error
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with id 123 not found",
    "details": []
  }
}
```

## Quy tắc Quan trọng

1. **Không circular dependency** giữa modules — dùng events hoặc shared kernel.
2. **Mỗi module phải có index.ts** export public API, không import sâu vào nội bộ module khác.
3. **Database transaction** chỉ được mở ở Application Layer.
4. **Mọi side effect** (email, queue, push notification) thực hiện sau khi domain action thành công.
5. **Không dùng ORM entity** trực tiếp trong Domain Layer — map sang domain entity.

## Architecture Decision Records (ADR)

Mọi quyết định kiến trúc quan trọng phải được ghi lại trong `docs/adr/` theo format:
```
docs/adr/
├── 001-use-postgresql-as-primary-db.md
├── 002-adopt-cqrs-for-order-module.md
└── 003-use-redis-for-session.md
```

Template ADR: `# ADR-NNN: [Tiêu đề]` → `## Status` → `## Context` → `## Decision` → `## Consequences`
