import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "المركز الإعلامي",
  description: "أخبار سوقنا ومعلومات للإعلام",
};

export default function PressPage() {
  return (
    <PublicShell pageTitle="المركز الإعلامي" pageDescription="أخبار المنصة ومعلومات للصحافة والشركاء">
      <div className="max-w-3xl mx-auto space-y-6 text-[var(--text-muted)]">
        <p>
          للاستفسارات الإعلامية والمواد الصحفية، يمكنكم مراسلة فريقنا وسنعود إليكم خلال أيام العمل.
        </p>
        <p>
          البريد المقترح:{" "}
          <a href="mailto:press@sooqna.com" className="font-semibold text-[var(--brand)] hover:underline">
            press@sooqna.com
          </a>
        </p>
      </div>
    </PublicShell>
  );
}
