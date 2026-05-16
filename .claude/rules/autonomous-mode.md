# Autonomous Mode Rules — Quân Nguyễn

Rules bắt buộc khi agent chạy trong **autonomous mode** (night-shift, scheduled /loop, dispatched subagents không supervised). Áp dụng bổ sung trên các rules khác (architecture.md, coding-style.md, testing.md).

## Khi rules này kích hoạt

- Env var `NIGHT_SHIFT_MODE=true`
- Hoặc skill `night-shift` đang chạy
- Hoặc Claude Code chạy qua `/schedule` cron
- Hoặc user explicit: "tự làm qua đêm", "run overnight", "không cần hỏi"

## 🔴 TUYỆT ĐỐI KHÔNG (Absolute Deny List)

### 1. Deploy production
```
❌ vercel deploy --prod / --production
❌ railway up --prod
❌ fly deploy
❌ netlify deploy --prod
❌ kubectl apply -f * (trừ local dev namespace)
❌ helm install / helm upgrade (trừ local)
❌ terraform apply (any env)
❌ ansible-playbook * (prod env)
❌ docker push * (push lên registry public)
❌ npm publish / pypi upload / cargo publish
```

### 2. Destructive git
```
❌ git push --force (any remote)
❌ git push origin main / master / prod / production / release
❌ git reset --hard (trên branch có commit của user)
❌ git checkout main|master → modify
❌ git branch -D (branch không phải của night-shift)
❌ git rebase -i (non-interactive auto rebase OK nếu cần)
❌ git clean -fd (xoá uncommitted work của user)
```

### 3. Destructive file system
```
❌ rm -rf (trừ: node_modules, dist, build, .cache, __pycache__, *.log tạm)
❌ xoá file trong docs/, src/ mà không có commit log
❌ overwrite file user đang có uncommitted changes
```

### 4. Destructive database
```
❌ DROP DATABASE
❌ DROP TABLE (trừ trong migration script có rollback)
❌ TRUNCATE * trên DB không phải local test
❌ Chạy migration production
```

### 5. External cost actions
```
❌ Gọi API thật gây phát sinh chi phí:
   - Anthropic/OpenAI API trong product code (dùng mock)
   - Stripe live mode (dùng test mode)
   - SendGrid send real email (log ra file)
   - Twilio SMS thật (log ra file)
   - AWS/GCP/Azure API phát sinh cost (tạo resource, compute)
❌ Purchase domain / hosting / license
❌ Spin up cloud resource (EC2, RDS, Lambda deploy thật)
```

### 6. Credential leak
```
❌ Log secret ra console/file (mask hoặc skip)
❌ Commit .env, .env.production, service-account.json, *.pem, *.key
❌ Commit token/API key embedded trong code
❌ Write secret vào PENDING_HUMAN.md (chỉ write tên biến, KHÔNG write value)
```

## 🟢 OK TO DO (Safe List)

### Code work
```
✅ Create / modify file trong src/, tests/, docs/ (feature branch)
✅ git commit vào feature branch (format: [night-shift] feat(scope): ...)
✅ git checkout -b feature/* hoặc night-shift/*
✅ git push origin night-shift/* (chỉ branch night-shift, không có trong deny list)
```

### Test & verification
```
✅ Run tests local: npm test, pytest, cargo test
✅ Run lint: eslint, ruff, mypy, tsc
✅ docker compose up (local dev stack)
✅ Run migration trên local DB / SQLite
✅ Generate test data / seed local
```

### Package management
```
✅ npm install <package> (package đã approve trong package.json)
✅ uv add / pip install (với dependency nhỏ, well-known)
🟡 Thêm dep mới không quen → log note trong report, để user review
```

### Documentation
```
✅ Update CHANGELOG.md
✅ Update README.md
✅ Viết ADR trong docs/adr/ (cho decision tự quyết)
✅ Update NIGHT_SHIFT_REPORT.md
```

## 🟡 CẦN GHI NHẬN (Log-and-decide)

Khi gặp các tình huống sau, agent **tự quyết nhưng phải log rõ** trong report để user check:

- Chọn thư viện: log lý do chọn, alternative xét qua
- Design pattern mới: viết ADR mini
- Refactor phạm vi rộng: log scope trước khi làm
- Dọn dẹp code cũ có comments "TODO": log từng TODO đã remove
- Bump version dependency: log before/after version + breaking change check

## Mock-First Rule

Khi code integration với external service:

```
BƯỚC 1: Tạo interface (port) trong domain/application
        interface PaymentAdapter { charge(...); ... }

BƯỚC 2: Implement MockAdapter đầu tiên (infrastructure/mock/)
        class MockPaymentAdapter implements PaymentAdapter { ... trả response giả lập ... }

BƯỚC 3: Viết tests dùng MockAdapter (đây là PHẢI có trước khi merge)

BƯỚC 4: Implement RealAdapter (infrastructure/stripe/)
        class StripePaymentAdapter implements PaymentAdapter { ... }
        // TODO(user): cần STRIPE_SECRET_KEY để test real, xem PENDING_HUMAN.md

BƯỚC 5: Wire lên DI container:
        if (process.env.NIGHT_SHIFT_MODE === 'true') inject MockAdapter;
        else inject RealAdapter;
```

**Nếu story không thể split:**
- Log PENDING_HUMAN với reason "blocked on external API setup"
- Skip story, tiếp task khác

## Self-check questions (trước khi commit)

Agent tự hỏi:

- [ ] Code này có gọi API thật (không phải mock) không? → NO
- [ ] Có secret/key hardcode trong code/commit không? → NO
- [ ] Có file `.env.production` hoặc secret file nào bị touch không? → NO
- [ ] Commit message có format đúng Conventional Commits + prefix `[night-shift]` không? → YES
- [ ] Test chạy pass trước khi commit không? → YES
- [ ] Có đang ở branch main/master/prod không? → NO (phải là feature/night-shift)
- [ ] Có vi phạm rule nào trong file này không? → NO

Nếu bất kỳ câu nào fail → **STOP**, log PENDING_HUMAN, không commit.

## Escape hatch — Khi không chắc

Khi không chắc có được làm không:
1. Check rule này lại
2. Check PENDING_HUMAN.md có entry tương tự chưa
3. Nếu vẫn không chắc → **log PENDING_HUMAN, skip task**
4. **NEVER** "làm tạm rồi xin lỗi sau"

## Recovery — Khi phát hiện vi phạm

Nếu agent lỡ vi phạm rule (VD: commit sai pattern):
1. Revert commit ngay: `git reset --soft HEAD~1`
2. Log vào NIGHT_SHIFT_REPORT.md section `## ⚠️ Violations detected and auto-reverted`
3. Skip task đó
4. Không tự sửa tiếp — user review sáng mai

---

**Phát triển bởi Quân Nguyễn — Safe by default, even at 3am.**
