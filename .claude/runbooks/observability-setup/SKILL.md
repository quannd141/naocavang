---
name: observability-setup
description: Setup 1 lần/dự án — Sentry (errors) + Better Stack (logs+uptime) + structured logging + alert rules. Đảm bảo khi prod gãy bạn biết trong < 5 phút, không phải user báo cáo.
tags: [devops, monitoring, observability, sentry, logging, alerts]
---

Bạn là **Observability Engineer** của Quân Nguyễn. Nhiệm vụ: setup hệ thống quan sát production sao cho:
- Mọi error được ghi nhận và alert nếu vượt threshold
- Mọi request/response có thể trace lại được
- Mọi metric quan trọng có dashboard real-time
- Alert đúng người, đúng channel, đúng severity

## Triết lý

> **"Bạn không thể fix cái bạn không thấy."**
> **"User báo bug = đã quá muộn."**

Setup đầy đủ này tốn 4-8 giờ ban đầu nhưng tiết kiệm hàng giờ debug + downtime.

---

## Stack chuẩn Quân Nguyễn

| Layer | Tool khuyến nghị | Miễn phí tier | Note |
|-------|------------------|---------------|------|
| Error tracking | **Sentry** | 5K events/month | Backend + Frontend |
| Log aggregation | **Better Stack (Logtail)** | 1GB/month | JSON logs, search nhanh |
| Uptime monitoring | **Better Stack** | Mỗi 3 phút | External ping |
| Metrics dashboard | **Grafana Cloud** hoặc **Datadog** | Hạn chế | p99 latency, throughput |
| APM (optional) | **Sentry Performance** hoặc **Datadog APM** | Limited | Trace request chi tiết |
| Status page | **Better Stack Status** hoặc **Instatus** | Free tier | Public status page |

**Alternative cho budget thấp:** Self-host Grafana + Loki + Prometheus.

---

## 1. Sentry Setup (errors)

### Backend (NestJS ví dụ)

```typescript
// apps/api/src/main.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV, // production / staging / development
  release: process.env.APP_VERSION, // gắn version để debug deploy nào gây lỗi

  // Performance monitoring
  tracesSampleRate: 0.1, // 10% requests for tracing
  profilesSampleRate: 0.1,

  integrations: [
    new ProfilingIntegration(),
    new Sentry.Integrations.Postgres(),
    new Sentry.Integrations.Http({ tracing: true }),
  ],

  // Exclude noise
  ignoreErrors: [
    'NotFoundException', // 404s không cần track
    /ECONNRESET/,
  ],

  // PII scrubbing — KHÔNG send email/password/token
  beforeSend(event) {
    if (event.request) {
      delete event.request.cookies;
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      if (event.request.data && typeof event.request.data === 'object') {
        const data = event.request.data as Record<string, unknown>;
        if (data.password) data.password = '[REDACTED]';
        if (data.token) data.token = '[REDACTED]';
        if (data.email) data.email = maskEmail(data.email as string);
      }
    }
    return event;
  },
});
```

### Frontend (Next.js)

```typescript
// apps/web/sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01, // 1% sessions for replay
  replaysOnErrorSampleRate: 1.0, // 100% nếu có error

  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    /Non-Error promise rejection/,
  ],
});
```

### Source map upload (CI)

```yaml
# .github/workflows/deploy.yml
- name: Upload source maps to Sentry
  run: |
    npx @sentry/cli releases new ${{ github.sha }}
    npx @sentry/cli releases files ${{ github.sha }} upload-sourcemaps ./dist
    npx @sentry/cli releases finalize ${{ github.sha }}
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
```

---

## 2. Structured Logging

### Pino setup (Node.js)

```typescript
// apps/api/src/shared/logger/pino.logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',

  // JSON format ở prod, pretty ở dev
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,

  // Auto-redact sensitive fields
  redact: {
    paths: [
      'password', '*.password',
      'token', '*.token', '*.accessToken', '*.refreshToken',
      'authorization', 'headers.authorization',
      'cookie', 'headers.cookie',
      'creditCard', '*.creditCard',
    ],
    censor: '[REDACTED]',
  },

  // Standard fields
  base: {
    env: process.env.NODE_ENV,
    service: 'snap-post-api',
    version: process.env.APP_VERSION,
  },

  // Better Stack target (hoặc Datadog, Logtail)
  ...(process.env.LOGTAIL_TOKEN && {
    transport: {
      target: '@logtail/pino',
      options: { sourceToken: process.env.LOGTAIL_TOKEN },
    },
  }),
});
```

### Request logging với correlation ID

```typescript
// apps/api/src/shared/middleware/request-logger.middleware.ts
import { v4 as uuidv4 } from 'uuid';

export function requestLogger(req, res, next) {
  const requestId = req.headers['x-request-id'] || uuidv4();
  const startTime = Date.now();

  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  logger.info({
    requestId,
    method: req.method,
    url: req.url,
    userId: req.user?.id, // KHÔNG log email
    userAgent: req.headers['user-agent'],
  }, 'request started');

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      requestId,
      statusCode: res.statusCode,
      duration,
    }, 'request completed');
  });

  next();
}
```

### Log levels — when to use

| Level | Use case |
|-------|----------|
| `fatal` | App sắp crash |
| `error` | Exception caught, request fail |
| `warn` | Suspicious nhưng không break (rate limit hit, retry) |
| `info` | Important business events (user signup, payment success) |
| `debug` | Dev only, verbose |
| `trace` | Almost never |

---

## 3. Uptime Monitoring (Better Stack)

### Setup

1. Better Stack → Create Heartbeat / Uptime monitor
2. Add monitor cho:
   - Main domain `https://app.snap-post.com` — ping every 1 phút
   - API `https://api.snap-post.com/health` — expect 200, body có `"status":"ok"`
   - Critical endpoint `https://api.snap-post.com/api/version`
3. Locations: chọn 3+ region (Singapore, US, EU)
4. Alert nếu down 2 consecutive checks

### Health endpoint chuẩn

```typescript
// apps/api/src/modules/health/health.controller.ts
@Get('/health')
async health() {
  const checks = await Promise.allSettled([
    this.dbHealthCheck(),
    this.redisHealthCheck(),
    this.queueHealthCheck(),
  ]);

  const allHealthy = checks.every((c) => c.status === 'fulfilled');

  return {
    status: allHealthy ? 'ok' : 'degraded',
    version: process.env.APP_VERSION,
    timestamp: new Date().toISOString(),
    checks: {
      db: checks[0].status === 'fulfilled' ? 'ok' : 'fail',
      redis: checks[1].status === 'fulfilled' ? 'ok' : 'fail',
      queue: checks[2].status === 'fulfilled' ? 'ok' : 'fail',
    },
  };
}
```

---

## 4. Metrics Dashboard

### Minimum metrics cần track

| Metric | Threshold (alert) | Tool |
|--------|------------------|------|
| Request rate (rpm) | Sudden drop > 50% | Grafana / Datadog |
| Error rate (%) | > 1% sustained 5 phút | Sentry |
| p95 latency | > baseline × 2 | Grafana / Datadog |
| p99 latency | > baseline × 3 | Grafana / Datadog |
| DB connection pool % | > 80% | Custom metric |
| Cache hit rate | Drop > 20% | Custom metric |
| Job queue depth | > 1000 backlog | Custom metric |
| AI API spend (USD/day) | > daily budget | Manual / cron |

### Custom metrics emission (Prometheus format)

```typescript
import { Counter, Histogram } from 'prom-client';

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
```

---

## 5. Alert Routing

### Severity → Channel matrix

| Severity | Channel | Wake people up? |
|----------|---------|----------------|
| **Critical** (P0) | PagerDuty / OpsGenie → SMS + Phone call | YES, 24/7 |
| **High** (P1) | Slack #alerts-critical + Email | Business hours OK |
| **Medium** (P2) | Slack #alerts | No |
| **Low** (P3) | Email digest daily | No |

### Sentry alert rules

Tạo rules:

1. **Critical: Error rate spike**
   - Condition: error count > 50 in 5 minutes
   - Action: PagerDuty + #alerts-critical
2. **High: New issue in production**
   - Condition: new issue first seen, env=production
   - Action: Slack #alerts
3. **Medium: Regression**
   - Condition: resolved issue reappears
   - Action: Slack #alerts

### Better Stack alert rules

1. **Critical: Site down**
   - Condition: 2 consecutive failed checks
   - Action: PagerDuty
2. **High: Slow response**
   - Condition: response time > 5s for 5 minutes
   - Action: Slack #alerts

---

## 6. Verify Setup (smoke tests)

Sau khi setup, verify hoạt động:

```bash
# Test 1: Sentry capture error
curl -X POST https://api.staging.snap-post.com/debug/throw-error
# → check Sentry dashboard có event mới

# Test 2: Log aggregation
docker logs api-container | grep "request completed"
# → check Better Stack có log mới

# Test 3: Uptime alert
# Tạm shutdown service 3 phút
# → expect SMS/email alert trong 4 phút

# Test 4: Health endpoint
curl https://api.snap-post.com/health | jq
# → expect status:ok, all checks pass
```

---

## Checklist hoàn thành setup

- [ ] Sentry DSN configured cho backend + frontend
- [ ] Sentry source map upload trong CI
- [ ] Sentry PII scrubbing tested (gửi event có password → check redacted)
- [ ] Pino logger với redact paths
- [ ] Request logger middleware (correlation ID)
- [ ] Better Stack uptime monitor cho 3+ endpoints
- [ ] Better Stack log shipping
- [ ] Health endpoint với DB/Redis/Queue checks
- [ ] Metrics dashboard với 8 metric chính
- [ ] Alert rules: critical → PagerDuty, high → Slack
- [ ] On-call rotation defined trong PagerDuty
- [ ] Smoke test 4 verifications trên đều pass
- [ ] Status page setup (public URL)

---

## Khi nào dùng skill này

- ✅ Sprint 0-1 của dự án mới (setup sớm, không để khi gãy mới setup)
- ✅ Khi adopt tool monitoring mới
- ✅ Sau incident: enhance dựa trên gap phát hiện ra
- ✅ Mỗi 6 tháng: review alert noise (mute rules ít actionable)

---

**Phát triển bởi Quân Nguyễn — See everything, fix anything.**
