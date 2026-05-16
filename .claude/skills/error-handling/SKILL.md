---
name: error-handling
description: Thiết kế và implement hệ thống xử lý lỗi nhất quán, structured logging và observability theo chuẩn production của Quân Nguyễn.
tags: [error-handling, logging, observability, reliability]
---

Bạn là **Reliability Engineer / Senior Developer** của Quân Nguyễn, chuyên về error handling và observability.

## Triết lý Xử lý Lỗi

1. **Fail fast, fail loudly** — lỗi phải được phát hiện và báo cáo ngay, không được nuốt âm thầm.
2. **Structured errors** — mọi lỗi phải có đủ context để debug mà không cần hỏi thêm.
3. **User-friendly messages** — người dùng thấy thông báo rõ ràng, developer thấy stack trace đầy đủ.
4. **Consistency** — toàn bộ codebase dùng cùng một pattern, không mỗi nơi một kiểu.

---

## 1. Custom Error Classes

```typescript
// base/errors.ts — Cấu trúc error hierarchy chuẩn

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
    public readonly isOperational: boolean = true, // operational vs programmer error
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Domain Errors (4xx)
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string | number) {
    super('NOT_FOUND', `${resource} with id '${id}' not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super('FORBIDDEN', message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}

// Infrastructure Errors (5xx)
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super('DATABASE_ERROR', message, 500, details, false);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super('EXTERNAL_SERVICE_ERROR', `${service}: ${message}`, 502, undefined, false);
  }
}
```

---

## 2. Global Error Handler

```typescript
// middleware/error-handler.middleware.ts

import { AppError } from '../base/errors';
import { logger } from '../logger';

export function globalErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    // Operational errors — expected, log as warning
    if (!err.isOperational) {
      logger.error('Non-operational error', {
        error: err.message,
        code: err.code,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: req.user?.id,
      });
    } else {
      logger.warn('Operational error', {
        error: err.message,
        code: err.code,
        path: req.path,
      });
    }

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? undefined,
      },
    });
  }

  // Unexpected / programmer errors
  logger.error('Unexpected error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Do NOT expose internal error details to client
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    },
  });
}
```

---

## 3. Structured Logging

### Setup Logger (Winston / Pino)

```typescript
// logger/index.ts — dùng Pino (nhanh hơn Winston)
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: ['*.password', '*.token', '*.secret', '*.apiKey', '*.creditCard'],
    censor: '[REDACTED]',
  },
  base: {
    env: process.env.NODE_ENV,
    service: process.env.SERVICE_NAME ?? 'app',
    version: process.env.APP_VERSION ?? '0.0.0',
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});
```

### Log Levels — Khi nào dùng gì
| Level | Khi nào dùng |
|-------|-------------|
| `error` | Lỗi nghiêm trọng, cần alert ngay (DB down, crash) |
| `warn` | Operational error, behavior bất thường nhưng hệ thống vẫn chạy |
| `info` | Sự kiện quan trọng (user login, order created, payment processed) |
| `debug` | Chi tiết kỹ thuật, chỉ bật khi debug |
| `trace` | Rất chi tiết (request/response body), chỉ dùng trong development |

### Log Format Chuẩn
```json
{
  "level": "error",
  "time": "2026-04-14T10:30:00.000Z",
  "service": "order-service",
  "version": "1.2.3",
  "traceId": "abc123def456",
  "userId": "user_789",
  "action": "create_order",
  "error": "Payment gateway timeout",
  "code": "EXTERNAL_SERVICE_ERROR",
  "duration": 5023,
  "metadata": {
    "orderId": "ord_456",
    "amount": 150000
  }
}
```

---

## 4. Request Tracing

```typescript
// middleware/request-id.middleware.ts
import { v4 as uuid } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

export const requestContext = new AsyncLocalStorage<{ traceId: string; userId?: string }>();

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const traceId = req.headers['x-trace-id'] as string ?? uuid();
  res.setHeader('x-trace-id', traceId);

  requestContext.run({ traceId, userId: req.user?.id }, () => next());
}

// Dùng trong bất kỳ service nào
const ctx = requestContext.getStore();
logger.info('Processing order', { ...ctx, orderId: order.id });
```

---

## 5. Error Handling trong Async Code

```typescript
// ❌ Không tốt — unhandled promise rejection
router.get('/users/:id', async (req, res) => {
  const user = await userService.findById(req.params.id); // có thể throw!
  res.json(user);
});

// ✅ Tốt — wrap async handler
function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) throw new NotFoundError('User', req.params.id);
  res.json({ success: true, data: user });
}));
```

---

## 6. Checklist Error Handling

Trước khi merge code, đảm bảo:
- [ ] Không có `catch (e) {}` rỗng — mọi error phải được xử lý hoặc re-throw.
- [ ] Không log `console.log` — dùng structured logger.
- [ ] Không expose stack trace ra client trong production.
- [ ] Mọi async function trong Express đều có error handling.
- [ ] Sensitive data (password, token) không bao giờ xuất hiện trong log.
- [ ] Error messages thân thiện với user (không "Null pointer exception").
- [ ] Có retry logic cho transient errors (network timeout, rate limit).
- [ ] Critical errors gửi alert (Sentry, PagerDuty) không chỉ log.

**Mục tiêu**: Khi lỗi xảy ra — dù 2 giờ sáng — developer có đủ thông tin để debug mà không cần hỏi thêm ai.
