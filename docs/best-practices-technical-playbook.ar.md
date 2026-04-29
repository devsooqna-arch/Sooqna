# Sooqna Technical Best Practices Playbook (مرجع شامل)

آخر تحديث: 2026-04-28  
النطاق: `apps/web` + `backend/sooqna-backend` + CI/CD + Database + Security + Operations

---

## 1) الهدف من هذا المستند

هذا المستند هو المرجع التنفيذي والتقني الرسمي لضبط جودة المشروع على كل النواحي:

- توحيد أسلوب البناء بين المحلي والإنتاج (Local = Production).
- منع الانحدار التقني (Regression) مع كل Feature جديدة.
- تحويل القرارات التقنية إلى قواعد قابلة للقياس والتنفيذ.
- تجهيز نفس الأساس لإعادة استخدامه على الويب + أندرويد + iOS.

---

## 2) مبادئ معمارية أساسية (Architecture Principles)

1. **Backend هو مصدر الحقيقة الوحيد**  
   لا يوجد Business Logic نهائي في الواجهة؛ الواجهة تعرض فقط.

2. **Firebase للمصادقة فقط**  
   الهوية من Firebase، لكن البيانات التشغيلية كلها في PostgreSQL عبر Backend.

3. **API Contracts أولاً**  
   أي تغيير endpoint أو payload يجب أن ينعكس على التوثيق والعقود قبل الدمج.

4. **Fail Fast بدل Silent Fallback**  
   عند فشل قاعدة البيانات أو التهيئة، يفشل النظام مبكراً برسالة واضحة (لا حلول صامتة).

5. **Security by Default**  
   كل endpoint محمي افتراضياً إلا ما يثبت العكس.

6. **Observability من اليوم الأول**  
   أي مسار حرج يجب أن يكون قابلًا للتتبع (Logs + Audit + Metrics).

---

## 3) معايير Backend (Express + Prisma)

## 3.1 تصميم الموديولات

لكل Module:

- `routes` لتعريف المسارات فقط.
- `controller` لفك/تركيب HTTP request/response.
- `service` للمنطق التجاري.
- `repository` للـ data access.
- `types/schemas` لتعريف العقود.

قاعدة مهمة:  
**ممنوع** وجود استعلامات DB مباشرة داخل `controller`.

## 3.2 Contracts والاستجابات

- نجاح: `success + data`.
- خطأ: `success=false + code + message + details`.
- أكواد الأخطاء يجب أن تكون ثابتة وقابلة للبحث (مثال: `EMAIL_NOT_VERIFIED`).
- أي endpoint جديد يجب أن يضاف إلى `docs/api-contract-v1.md` أو نسخة v2 عند الحاجة.

## 3.3 Validation و Sanitization

- كل body/query/params عبر schema validator (Zod).
- رفض المدخلات غير المتوقعة (`stripUnknown` behavior).
- تطبيع (canonicalization) للفلترة: city/category/search في نقطة مركزية.

## 3.4 Pagination / Sorting / Filtering

- pagination server-side فقط.
- sort whitelist ثابت (`newest`, `price_asc`, `price_desc`).
- max limit إلزامي لمنع overload.
- response يجب أن يتضمن info كافية لإعادة بناء UI (total/limit/offset/filters).

## 3.5 Transactions و Consistency

- أي counter حساس (favorites/views/unread) يجب أن يُدار بعملية atomic أو reconciliation routine.
- المسارات متعددة العمليات (multi-step persistence) تستخدم transaction أو fallback compensation واضح.

## 3.6 Error Handling

- خطأ داخلي: لا تُسرّب stack أو أسرار للعميل.
- log داخلي + error code للعميل.
- توحيد `400/401/403/404/409/422/429/500`.

---

## 4) معايير Frontend (Next.js + UI System)

## 4.1 بنية الواجهة

- `services/*` فقط للتواصل مع الـ API.
- `components/*` لا تحتوي network logic ثقيل.
- `hooks/*` لتجميع logic متكرر.
- types مشتركة ومشتقة من contracts قدر الإمكان.

## 4.2 State Management

- URL هو source of truth للفلاتر والـ pagination (قابل للمشاركة والرجوع).
- Optimistic UI فقط عندما توجد strategy rollback واضحة.
- أي offline queue يجب أن يمتلك retry policy + deduplication.

## 4.3 Design System و UX

- استخدام tokens فقط (`--color-*`, `--font-primary`, shadows, radii).
- منع hardcoded colors على مستوى المكونات إلا للحالات الخاصة.
- توحيد العناصر عبر reusable classes (`ui-btn`, `ui-card`, `ui-input`, `ui-select`).
- RTL و Cairo global لا استثناءات.
- Native dropdowns في المسارات الأساسية تُستبدل بمكونات custom إذا أثرت على التجربة.

## 4.4 Accessibility (A11y)

- عناصر تفاعلية مع `aria-*` وkeyboard support.
- contrast لا يقل عن WCAG AA.
- focus ring واضح على كل عناصر الإدخال والتنقل.

---

## 5) Authentication & Authorization

- التحقق من token عبر middleware مركزي.
- اعتماد email verification في المسارات الحساسة.
- RBAC بسيط وواضح (Admin/User) ثم التوسع لاحقاً لـ scopes.
- session endpoints يجب أن تعيد minimal identity + verification state.

Best practice إضافية:

- short-lived ID tokens + server validation دائم.
- عدم الوثوق بأي role من client مباشرة.

---

## 6) Security Hardening

## 6.1 حماية API

- Rate limiting حسب الحساسية (Auth/Reports/Messages/Favorites).
- حماية abuse patterns (burst + brute-force + replay attempts).
- Helmet + CORS مضبوطين على whitelist.

## 6.2 Content Safety

- keyword filtering على نقاط الإدخال الحساسة.
- report workflow واضح (submit -> queue -> moderator action).
- audit لكل action أمني أو تغييرات حساسة.

## 6.3 Secrets Management

- لا أسرار داخل git.
- env templates في `.env.example` فقط.
- تدوير secrets دورياً (rotation policy).

## 6.4 Upload Security

- whitelist MIME + max size + max count.
- إزالة filenames الأصلية الحساسة.
- منع executable uploads.

---

## 7) Database Best Practices (PostgreSQL + Prisma)

1. **Schema as source of truth** عبر Prisma + migrations.
2. **No drift policy**: أي اختلاف schema/migration يجب أن يُعالج فوراً.
3. **Index strategy**:
   - listing filters: `(status, city, categoryId, createdAt)`.
   - messaging: `(conversationId, createdAt)`.
   - favorites uniqueness: `(userId, listingId)`.
4. **Soft-delete policy** موحدة للكائنات التي تحتاج traceability.
5. **Data retention policy** لـ audit/engagement/events.
6. **Backups**:
   - daily snapshot
   - weekly restore test
   - RPO/RTO موثقين.

---

## 8) CI/CD و Release Engineering

## 8.1 CI Minimum Gate

- Backend: install + typecheck + build (+ tests تدريجياً).
- Web: install + lint + build.
- منع merge عند failure.

## 8.2 Deployment Safety

- blue/green أو rolling تدريجي عند التوسع.
- pre-deploy: migrations dry-run + db:check.
- post-deploy: health checks (`/api/health`, homepage).
- rollback script موثق ومرن.

## 8.3 Local = Production Parity

- نفس env flags الحساسة في local/prod (خاصة fallback switches).
- منع تشغيل backend إذا DB check فشل.

---

## 9) Observability (Logs, Audit, Metrics, Alerts)

## 9.1 Logging

- structured logs (JSON في الإنتاج).
- correlation id لكل request.
- masking للبيانات الحساسة.

## 9.2 Audit Log

- كل action حساس: actor + action + target + metadata + timestamp.
- retention + queryability لمسار الامتثال.

## 9.3 Metrics

حد أدنى مطلوب:

- Request latency (p50/p95/p99)
- Error rate by endpoint
- DB query latency
- Queue retries / failed background jobs
- Login success vs failure

## 9.4 Alerts

- 5xx spike
- auth failures spike
- DB connection instability
- latency degradation

---

## 10) Testing Strategy

## 10.1 Backend

- Unit tests للخدمات الحرجة (listing lifecycle, favorites consistency, message unread).
- Integration tests لمسارات API الأساسية.
- Contract tests للتأكد من ثبات payload.

## 10.2 Frontend

- Component tests للمكونات الحرجة.
- E2E smoke على flows الأساسية:
  - تسجيل/دخول
  - إنشاء إعلان
  - فلترة/بحث
  - مراسلة
  - مفضلة

## 10.3 Test Data

- fixtures ثابتة وقابلة للإعادة.
- seed scripts واضحة وغير destructive.

---

## 11) Performance Guidelines

- Web:
  - تقليل JS bundle.
  - lazy loading للمناطق الثقيلة.
  - image optimization + caching.
- Backend:
  - تجنب N+1 queries.
  - pagination إلزامية.
  - caching selective للقراءات الكثيفة.
- DB:
  - `EXPLAIN ANALYZE` دوري لأبطأ الاستعلامات.

---

## 12) Cross-Platform Readiness (Web + Android + iOS)

- توحيد contracts و enums في طبقة backend.
- أي منطق Product لا يُكرر على المنصات.
- mobile/web clients يستخدمون نفس API behavior.
- أي feature جديدة لا تُعتبر “Done” قبل تعريفها multi-platform ready.

---

## 13) Definition of Done (تقني)

الميزة لا تُغلق إلا إذا تحقّق:

1. API contract محدث.
2. Validation + auth + error codes مكتملة.
3. Logs/Audit (إذا feature حساسة) مضافة.
4. Tests الأساسية ناجحة.
5. UI مطابق Design System.
6. Docs محدثة.
7. لا lint/type errors.

---

## 14) Roadmap تقني مقترح (90 يوم)

## المرحلة A (أسبوع 1-3): الصلابة الأساسية

- توحيد contracts بنسبة 100%.
- إغلاق أي schema drift.
- استكمال custom dropdown/menu patterns لكل الواجهات الأساسية.

## المرحلة B (أسبوع 4-8): الأمان والمراقبة

- structured logging + correlation IDs.
- dashboards + alerts أساسية.
- security tests + abuse simulations.

## المرحلة C (أسبوع 9-12): الاعتمادية والتوسع

- test coverage expansion.
- performance tuning cycles.
- release checklist automation.

---

## 15) قرارات إلزامية فورية (High Priority)

1. اعتماد هذا المستند كمرجع رسمي للمراجعة التقنية.
2. أي PR جديد يجب أن يمر على Checklist تنفيذية.
3. منع أي UI جديد خارج design tokens/classes الموحّدة.
4. تشغيل مراجعة أسبوعية للـ metrics + audit + top errors.

---

## 16) مراجع داخل المشروع

- `README.md`
- `docs/api-contract-v1.md`
- `docs/project-structure-a-to-z.md`
- `docs/week-3-profile-identity.md`
- `docs/user-action-batch/README.ar.md`

