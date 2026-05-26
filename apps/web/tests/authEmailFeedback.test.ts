import assert from "node:assert/strict";
import { getResendVerificationState } from "../src/components/auth/resendVerificationState";
import { getAuthErrorMessage } from "../src/services/authErrors";

assert.deepEqual(
  getResendVerificationState({ sending: true, cooldownRemainingSeconds: 0 }),
  {
    disabled: true,
    label: "جاري الإرسال...",
    helpText: null,
  },
  "resend control should be disabled while the Firebase request is pending"
);

assert.deepEqual(
  getResendVerificationState({ sending: false, cooldownRemainingSeconds: 42 }),
  {
    disabled: true,
    label: "يمكنك إعادة الإرسال بعد 42 ثانية",
    helpText: "انتظر قليلاً قبل طلب رابط تحقق جديد.",
  },
  "resend control should show a cooldown instead of allowing rapid repeated sends"
);

assert.equal(
  getAuthErrorMessage({ code: "auth/too-many-requests" }),
  "تم إيقاف المحاولات مؤقتاً بسبب كثرة الطلبات. انتظر بضع دقائق ثم حاول مرة أخرى.",
  "Firebase too-many-requests should explain the rate limit in Arabic"
);
