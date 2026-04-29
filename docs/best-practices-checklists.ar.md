# Sooqna Best Practices Checklists (تشغيلية وتقنية)

آخر تحديث: 2026-04-28

استخدم هذا الملف كـ checklist يومي/أسبوعي قبل الدمج والإطلاق.

---

## 1) Checklist لكل Pull Request

- [ ] API contract لم يتكسر (أو تم تحديث التوثيق).
- [ ] لا يوجد hardcoded enums خارج source constants.
- [ ] validation موجود لكل input جديد.
- [ ] auth/authorization مضافة للمسارات الحساسة.
- [ ] error codes واضحة ومفهومة.
- [ ] لا يوجد lint/type errors.
- [ ] لا يوجد secrets أو `.env` ضمن commit.
- [ ] UI ملتزم Design System tokens/classes.
- [ ] تم اختبار المسار الأساسي يدويًا.

---

## 2) Checklist Backend Feature

- [ ] Route -> Controller -> Service -> Repository separation واضح.
- [ ] schema validation (body/query/params) مفعّلة.
- [ ] rate limit مناسب (إن كان endpoint حساس).
- [ ] audit log مضاف للإجراءات الحساسة.
- [ ] log داخلي جيد دون تسريب بيانات حساسة.
- [ ] pagination/sort guardrails موجودة.
- [ ] migration/database impact موثق.

---

## 3) Checklist Frontend Feature

- [ ] لا network calls مباشرة داخل component غير service layer.
- [ ] loading/error/empty states موجودة.
- [ ] URL state مضبوط للفلاتر/البحث.
- [ ] optimistic updates فيها rollback واضح.
- [ ] keyboard + focus + a11y attributes مقبولة.
- [ ] mobile responsiveness مجربة.
- [ ] النصوص عربية كاملة وRTL صحيح.

---

## 4) Checklist Security

- [ ] require verified email على المسارات الحساسة.
- [ ] recaptcha/anti-abuse مفعّل عند الحاجة.
- [ ] upload restrictions (size/type/count) مطبقة.
- [ ] CORS whitelist مضبوط.
- [ ] no sensitive data in logs.
- [ ] admin-only endpoints محمية بـ scope واضح.

---

## 5) Checklist Database

- [ ] Prisma schema + migrations بدون drift.
- [ ] indexes للمسارات الأعلى استخدامًا.
- [ ] transaction/atomicity في العمليات الحساسة.
- [ ] backup policy موجودة ومختبرة.
- [ ] restore test تم ضمن آخر 30 يوم.

---

## 6) Checklist قبل أي Deploy

- [ ] CI أخضر بالكامل.
- [ ] `db:check` ناجح.
- [ ] env vars مكتملة (web/backend).
- [ ] smoke test محلي ناجح.
- [ ] release notes مختصرة مكتوبة.
- [ ] rollback plan جاهز.

---

## 7) Checklist بعد Deploy (خلال أول 30 دقيقة)

- [ ] `GET /api/health` طبيعي.
- [ ] الصفحة الرئيسية تعمل.
- [ ] login/signup flow سليم.
- [ ] listing create + list + detail تعمل.
- [ ] messages/favorites endpoint health سليم.
- [ ] لا spike في 5xx.
- [ ] latency ضمن الحدود المتوقعة.

---

## 8) Weekly Operations Checklist

- [ ] مراجعة أعلى 10 أخطاء API.
- [ ] مراجعة auth failure rate.
- [ ] مراجعة أبطأ endpoints.
- [ ] مراجعة audit للأفعال الحساسة.
- [ ] تنظيف technical debt items وتحديد owner/date.
- [ ] مراجعة تغطية الاختبارات وتوسيعها.

---

## 9) Monthly Architecture Review Checklist

- [ ] التزام كامل بمبدأ Backend source-of-truth.
- [ ] لا feature logic منسوخ بين web/backend.
- [ ] عقود API ما زالت مناسبة للتطبيقات المتعددة.
- [ ] readiness للموبايل (Android/iOS) تم التحقق منها.
- [ ] مراجعة performance budget ونتائج التحسين.
- [ ] تحديث المستندات الرسمية بما يتوافق مع الواقع.

